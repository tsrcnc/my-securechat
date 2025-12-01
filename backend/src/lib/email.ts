import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. OTP not sent via email.');
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'My SecureChat <onboarding@resend.dev>', // Use default testing domain or configured domain
            to: email,
            subject: 'Your Verification Code - My SecureChat',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Verify your email address</h2>
                    <p>Thanks for starting the registration process for My SecureChat.</p>
                    <p>Your verification code is:</p>
                    <h1 style="background: #f4f4f5; padding: 20px; text-align: center; letter-spacing: 10px; border-radius: 8px;">${otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        });
        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification email');
    }
}
