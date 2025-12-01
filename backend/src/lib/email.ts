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

export async function sendDomainVerificationEmail(
    email: string,
    domain: string,
    token: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Domain verification email not sent.');
        console.log(`[DEV MODE] Domain verification for ${domain} - Token: ${token}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'My SecureChat <auth@noreplay.mysecurechat.org>',
            to: [email],
            subject: `Verify Your Domain - ${domain} | My SecureChat`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Domain</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Welcome to My SecureChat!</h1>
                                            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Secure Enterprise Messaging Platform</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Domain Verification Required</h2>
                                            <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                                                Thank you for registering <strong>${domain}</strong>! Your domain has been created and is ready to be verified.
                                            </p>
                                            <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                                To enable messaging for all users from your domain, please verify domain ownership by adding a DNS TXT record.
                                            </p>
                                            
                                            <!-- DNS Record Box -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                                <tr>
                                                    <td style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                                        <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">DNS TXT Record Details</p>
                                                        
                                                        <p style="color: #374151; margin: 0 0 5px 0; font-size: 13px;"><strong>Host/Name:</strong></p>
                                                        <p style="color: #111827; margin: 0 0 15px 0; font-size: 14px; background: #ffffff; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace; word-break: break-all;">_my-securechat-verification.${domain}</p>
                                                        
                                                        <p style="color: #374151; margin: 0 0 5px 0; font-size: 13px;"><strong>Type:</strong></p>
                                                        <p style="color: #111827; margin: 0 0 15px 0; font-size: 14px; background: #ffffff; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace;">TXT</p>
                                                        
                                                        <p style="color: #374151; margin: 0 0 5px 0; font-size: 13px;"><strong>Value:</strong></p>
                                                        <p style="color: #111827; margin: 0 0 15px 0; font-size: 14px; background: #ffffff; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace; word-break: break-all;">${token}</p>
                                                        
                                                        <p style="color: #374151; margin: 0 0 5px 0; font-size: 13px;"><strong>TTL:</strong></p>
                                                        <p style="color: #111827; margin: 0; font-size: 14px; background: #ffffff; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace;">3600 (or Auto)</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Steps -->
                                            <h3 style="color: #111827; margin: 30px 0 15px 0; font-size: 18px; font-weight: 600;">Verification Steps:</h3>
                                            <ol style="color: #4b5563; margin: 0 0 30px 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                                                <li>Log in to your domain registrar or DNS provider</li>
                                                <li>Navigate to DNS settings or DNS management</li>
                                                <li>Add a new TXT record with the details shown above</li>
                                                <li>Wait for DNS propagation (usually 1-2 hours, max 24 hours)</li>
                                                <li>Return to My SecureChat and click "Verify Now"</li>
                                            </ol>
                                            
                                            <!-- CTA Button -->
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td align="center" style="padding: 20px 0;">
                                                        <a href="http://localhost:3000/domain-verify?domain=${domain}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify My Domain</a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                                                <strong style="color: #111827;">⏰ Important:</strong> DNS changes can take up to 24 hours to propagate globally, but usually complete within 1-2 hours.
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
                                            <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
                                                Need help? Contact us at <a href="mailto:support@mysecurechat.org" style="color: #3b82f6; text-decoration: none;">support@mysecurechat.org</a>
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
            console.error('Failed to send domain verification email:', error);
            throw new Error(`Email sending failed: ${error.message}`);
        }

        console.log(`Domain verification email sent to ${email} for ${domain}. Message ID: ${data?.id}`);
    } catch (error) {
        console.error('Error in sendDomainVerificationEmail:', error);
        throw error;
    }
}
