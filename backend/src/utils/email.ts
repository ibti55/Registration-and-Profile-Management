import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BPSC" <noreply@bpsc.gov.bd>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
    // Don't throw – email failure should not block registration flow
    // In production, queue for retry
  }
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || '5';
  await sendEmail({
    to: email,
    subject: 'BPSC Registration - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #449653, #2d7a3d); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BPSC - Email Verification</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Your OTP for email verification is:</p>
          <div style="background: white; border: 2px dashed #449653; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #449653;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>${expiryMinutes} minutes</strong>.</p>
          <p style="font-size: 14px; color: #666;">If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Bangladesh Public Service Commission (BPSC)</p>
        </div>
      </div>
    `,
  });
};
