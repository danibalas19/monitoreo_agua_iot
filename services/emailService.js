import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

class EmailService {
  static async sendPasswordResetEmail(email, token) {
    try {
      // Verificación de variables de entorno para un mejor diagnóstico
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.error('Faltan variables de entorno SMTP. Asegúrate de que SMTP_HOST, SMTP_USER, y SMTP_PASS estén configuradas en el archivo .env');
        throw new Error('El servicio de correo no está configurado correctamente en el servidor.');
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/recuperar?token=${token}`;

      const mailOptions = {
        from: `"Sistema IoT Jagüeyes" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña - Sistema IoT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #1F4E79; text-align: center;">Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="padding: 12px 24px; background-color: #2E75B6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
            </div>
            <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
            <p style="color: #666; font-size: 14px;">Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Correo de recuperación enviado a ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

export default EmailService;