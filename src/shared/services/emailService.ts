import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'fitnessprimeok@gmail.com',
    pass: process.env.EMAIL_PASS || 'ihklojlxpyxznxnz',
  },
});

/**
 * Envía un código de recuperación de contraseña por email
 * @param email Email del destinatario
 * @param code Código de 6 dígitos
 * @param nombre Nombre del usuario
 */
export async function sendRecoveryCode(
  email: string,
  code: string,
  nombre: string
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'fitnessprimeok@gmail.com',
    to: email,
    subject: 'Código de Recuperación de Contraseña - Fitness App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f4f4f4;
            padding: 30px;
            border-radius: 10px;
          }
          .code-box {
            background-color: #fff;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            margin: 20px 0;
            border: 2px solid #4CAF50;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #4CAF50;
          }
          .warning {
            color: #d32f2f;
            font-size: 14px;
            margin-top: 15px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hola ${nombre},</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña en Fitness App</p>
          <p>Tu código de recuperación es:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p>Este código es válido por <strong>15 minutos</strong>.</p>
          
          <p class="warning">
            ⚠️ Si no solicitaste este código, ignora este mensaje. 
            Tu contraseña permanecerá segura.
          </p>
          
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
            <p>&copy; ${new Date().getFullYear()} Fitness App- Sistema de Gestión de Gimnasio</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Código de recuperación enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error('No se pudo enviar el código por email');
  }
}

/**
 * Genera un código aleatorio de 6 dígitos
 */
export function generateRecoveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
