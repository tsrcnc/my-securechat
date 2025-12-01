import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. OTP not sent via email.');
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'My SecureChat <auth@noreplay.mysecurechat.org>',
            to: [email],
            subject: 'Your Verification Code - My SecureChat',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verification Code</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">My SecureChat</h1>
                                            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Secure Enterprise Messaging</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                                            <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                                Thank you for signing up! Please use the verification code below to complete your registration.
                                            </p>
                                            
                                            <!-- OTP Box -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                                <tr>
                                                    <td align="center" style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; padding: 30px;">
                                                        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                                        <p style="color: #111827; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                                                <strong style="color: #111827;">⏰ This code will expire in 10 minutes.</strong><br>
                                                If you didn't request this code, please ignore this email.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                                            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                                                © 2025 TSR CNC - My SecureChat<br>
                                                Secure messaging for verified domains
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Failed to send OTP email:', error);
            throw new Error(`Email sending failed: ${error.message}`);
        }

        console.log(`OTP email sent successfully to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
        console.error('Error in sendOTPEmail:', error);
        throw error;
    }
}
