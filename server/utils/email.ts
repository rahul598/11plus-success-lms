import nodemailer from 'nodemailer';

// Create SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.kafilontech.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
    ciphers: 'SSLv3'
  },
  debug: true // Enable debug logging
});

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: '"11Plus-Success" <test@kafilontech.com>',
    to: email,
    subject: 'Welcome to 11Plus-Success!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D3648;">Welcome ${name}! 🎉</h2>
        <p>Thank you for joining our educational platform. We're excited to have you on board!</p>
        <p>Get ready to:</p>
        <ul>
          <li>Access premium study materials</li>
          <li>Take mock tests</li>
          <li>Track your progress</li>
          <li>Connect with expert tutors</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The 11Plus-Success Team</p>
      </div>
    `
  };

  try {
    // Verify connection configuration
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.error('SMTP Verification Error:', error);
          reject(error);
        } else {
          console.log('Server is ready to take our messages');
          resolve(success);
        }
      });
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Continue with user registration even if email fails
    return false;
  }
}