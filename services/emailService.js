import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@example.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport(
  SMTP_HOST
    ? {
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      }
    : // If no SMTP configured, use a stub that logs
      { sendMail: (opts) => { console.log('Simulated email send', opts); return Promise.resolve(); } }
);

export default {
  async sendPasswordResetEmail(to, token) {
    const resetUrl = `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${token}`;
    const mailOptions = {
      from: SMTP_FROM,
      to,
      subject: 'Recuperación de contraseña',
      text: `Se solicitó restablecer la contraseña. Visita: ${resetUrl}`,
      html: `<p>Se solicitó restablecer la contraseña. Haz clic en el siguiente enlace para restablecerla (expira en 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent to', to);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};