import nodemailer from 'nodemailer';

// Create a test account using Ethereal for development
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'demo@ethereal.email',
    pass: process.env.EMAIL_PASS || 'demo123'
  }
});

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: '"Educational Platform" <noreply@eduplatform.com>',
    to: email,
    subject: 'Welcome to Our Educational Platform!',
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
        <p>Best regards,<br>The Education Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}
