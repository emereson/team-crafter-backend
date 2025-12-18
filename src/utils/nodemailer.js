import nodemailer from 'nodemailer';
import { FRONTEND_URL } from '../../config.js';
import logger from './logger.js';

export const transporter = nodemailer.createTransport({
  host: 'mail.team-crafter.com',
  port: 587, // SMTP TLS
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
  tls: {
    rejectUnauthorized: false, // útil en VPS
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error(error);
  } else {
    logger.info('Conexión exitosa con el servidor de correo');
  }
});

export const sendConfirmationEmail = async (
  nombre,
  correo,
  verificationLink,
  plan
) => {
  try {
    const emailBody = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a Team Crafter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 0;">
        
        <!-- Header Rosa -->
        <div style="background: linear-gradient(135deg, #f06292 0%, #e91e63 100%); padding: 40px 20px; text-align: center; border-radius: 0;">
            <img src="https://app.team-crafter.com/_next/image?url=%2Flogo.png&w=1920&q=75" alt="Team Crafter" style="max-width: 200px; height: auto;" />
        </div>
        
        <!-- Contenido Principal -->
        <div style="padding: 40px 30px; background-color: white; color: #666666; line-height: 1.6;">
            
            <h1 style="color: #999999; font-size: 28px; margin-bottom: 10px; font-weight: normal;">
                ¡Hola <span style="color: #4dd0e1;">${nombre}</span>! 👋
            </h1>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 20px;">
                ¡Bienvenido a Team Crafter! 🎉 Desde hoy, formas parte de una comunidad creativa apasionada por la Papelería Creativa y los Productos Personalizados. Estamos emocionados de acompañarte en este viaje.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 20px;">
                ⭐ Visita tu dashboard para explorar todo lo que hemos preparado para ti.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 30px;">
                ⭐ Descarga los recursos más recientes para aprovechar al máximo tu suscripción.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 10px;">
                Si tienes alguna duda o necesitas ayuda, siempre estamos aquí para apoyarte.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 30px;">
                📧 Contacto directo: [Correo de soporte]
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 40px;">
                ¡Gracias por confiar en nosotros para dar vida a tus proyectos creativos!
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 10px;">
                Con cariño,
            </p>
            <p style="font-size: 16px; color: #999999; margin-bottom: 40px;">
                El equipo de Team Crafter
            </p>
            
            <!-- Línea separadora -->
            <hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 40px 0;" />
            
            <!-- Botón CTA -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${FRONTEND_URL}/verificar-correo?token=${verificationLink}${
      plan !== 'null' && plan.length > 0 ? `&plan=${plan}` : ''
    }" 
                   style="display: inline-block; background: linear-gradient(135deg, #f06292 0%, #e91e63 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; text-align: center;">
                   Click para verificar mi correo electronico
                </a>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div style="padding: 20px 30px; background-color: white; text-align: center; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.4;">
                Para asegurarte de seguir recibiendo estos correos electrónicos, agrega nuestro correo electrónico a tu libreta de direcciones. 
            </p>
        </div>
        
    </div>
</body>
</html>
`;

    const mailOptions = {
      from: `ventas@team-crafter.com`,
      to: correo,
      subject: '¡Bienvenido a Team Crafter! 🎉',
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📩 Correo enviado a: ${correo}, ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`❌ Error al enviar el correo electrónico:`, error);
  }
};

export const sendPasswordRecoveryEmail = async (
  nombre,
  correo,
  recoveryToken
) => {
  try {
    const emailBody = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - Team Crafter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 0;">
        
        <!-- Header Rosa -->
        <div style="background: linear-gradient(135deg, #f06292 0%, #e91e63 100%); padding: 40px 20px; text-align: center; border-radius: 0;">
            <img src="https://app.team-crafter.com/_next/image?url=%2Flogo.png&w=1920&q=75" alt="Team Crafter" style="max-width: 200px; height: auto;" />
        </div>
        
        <!-- Contenido Principal -->
        <div style="padding: 40px 30px; background-color: white; color: #666666; line-height: 1.6;">
            
            <h1 style="color: #999999; font-size: 28px; margin-bottom: 10px; font-weight: normal;">
                ¡Hola <span style="color: #4dd0e1;">${nombre}</span>! 🔐
            </h1>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 20px;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Team Crafter. ¡No te preocupes, estamos aquí para ayudarte!
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 20px;">
                🔑 Haz clic en el botón de abajo para crear una nueva contraseña segura.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 30px;">
                ⏰ Este enlace es válido por 24 horas por motivos de seguridad.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 20px;">
                Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 30px;">
                Si tienes alguna duda o necesitas ayuda adicional, siempre estamos aquí para apoyarte.
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 10px;">
                📧 Contacto directo: soporte@team-crafter.com
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 40px;">
                ¡Gracias por ser parte de la comunidad Team Crafter!
            </p>
            
            <p style="font-size: 16px; color: #999999; margin-bottom: 10px;">
                Con cariño,
            </p>
            <p style="font-size: 16px; color: #999999; margin-bottom: 40px;">
                El equipo de Team Crafter
            </p>
            
            <!-- Línea separadora -->
            <hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 40px 0;" />
            
            <!-- Botón CTA -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${FRONTEND_URL}/nuevo-password?token=${recoveryToken}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f06292 0%, #e91e63 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; text-align: center;">
                    Restablecer mi contraseña
                </a>
            </div>
            
            <!-- Aviso de seguridad -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 30px 0;">
                <p style="font-size: 14px; color: #856404; margin: 0; text-align: center;">
                    🛡️ <strong>Importante:</strong> Si no solicitaste este cambio, te recomendamos revisar la seguridad de tu cuenta.
                </p>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div style="padding: 20px 30px; background-color: white; text-align: center; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.4;">
                Para asegurarte de seguir recibiendo estos correos electrónicos, agrega nuestro correo electrónico a tu libreta de direcciones. 
            </p>
        </div>
        
    </div>
</body>
</html>
`;

    const mailOptions = {
      from: `ventas@team-crafter.com`,
      to: correo,
      subject: '🔐 Restablece tu contraseña - Team Crafter',
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(
      `🔐 Correo de recuperación enviado a: ${correo}, ID: ${info.messageId}`
    );

    return {
      success: true,
      messageId: info.messageId,
      message: 'Correo de recuperación enviado exitosamente',
    };
  } catch (error) {
    logger.error(`❌ Error al enviar el correo de recuperación:`, error);

    return {
      success: false,
      error: error.message,
      message: 'Error al enviar el correo de recuperación',
    };
  }
};

export const sendRecursoCaducado = async (
  nombre_recurso,
  correo_usuario,
  mensaje
) => {
  try {
    const emailBody = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recurso Expirado - Team Crafter</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f0f0f0;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: linear-gradient(135deg, #ff69b4 0%, #e91e63 50%, #9c27b0 100%);
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .header {
                text-align: left;
                margin-bottom: 30px;
            }
            .title {
                color: white;
                font-size: 48px;
                font-weight: 900;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                letter-spacing: -1px;
            }
            .resource-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .resource-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, #ff9800, #f57c00);
                border-radius: 15px;
                display: inline-block;
                margin-right: 20px;
                vertical-align: top;
                position: relative;
                box-shadow: 0 4px 15px rgba(255,152,0,0.3);
            }
            .resource-icon::before {
                content: "📁";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 35px;
            }
            .resource-content {
                display: inline-block;
                vertical-align: top;
                width: calc(100% - 120px);
                padding-top: 10px;
            }
            .resource-title {
                color: #424242;
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 10px 0;
                line-height: 1.3;
            }
            .section-title {
                color: white;
                font-size: 36px;
                font-weight: 800;
                margin: 30px 0 20px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .status {
                background: rgba(66, 66, 66, 0.9);
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                font-size: 28px;
                font-weight: 700;
                text-align: center;
                margin: 20px 0;
                letter-spacing: 2px;
                text-transform: uppercase;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .message-section {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .message-title {
                color: #ff69b4;
                font-size: 32px;
                font-weight: 800;
                margin: 0 0 15px 0;
            }
            .message-content {
                color: #555;
                font-size: 18px;
                line-height: 1.6;
                margin: 0;
                background: #f8f8f8;
                padding: 20px;
                border-radius: 10px;
                border-left: 5px solid #ff69b4;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid rgba(255,255,255,0.3);
            }
            .footer p {
                color: white;
                font-size: 14px;
                margin: 5px 0;
                opacity: 0.9;
            }
            .logo {
                color: white;
                font-size: 24px;
                font-weight: 800;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .user-info {
                background: rgba(255,255,255,0.2);
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
                border: 1px solid rgba(255,255,255,0.3);
            }
            .user-info p {
                color: white;
                margin: 5px 0;
                font-size: 16px;
            }
            .user-info strong {
                color: #000000ff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">Recurso</h1>
            </div>
            
            <div class="resource-card">
                <div class="resource-icon"></div>
                <div class="resource-content">
                    <h2 class="resource-title">${nombre_recurso}</h2>
                    <div class="user-info">
                        <p><strong>Usuario:</strong> ${correo_usuario}</p>
                    </div>
                </div>
            </div>
            
            <h2 class="section-title">Asunto</h2>
            <div class="status">EXPIRADO TEAM CRAFTER</div>
            
            <h2 class="section-title">Mensaje</h2>
            <div class="message-section">
                <h3 class="message-title">Mensaje</h3>
                <p class="message-content">${mensaje}</p>
            </div>
            
            <div class="footer">
                <div class="logo">TEAM CRAFTER</div>
                <p>Este es un mensaje automático del sistema</p>
                <p>&copy; 2025 Team Crafter - Todos los derechos reservados</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `ventas@team-crafter.com`,
      to: correo_usuario, // Cambiado para enviar al usuario correcto
      subject: 'EXPIRADO TEAM CRAFTER',
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(
      `EXPIRADO TEAM CRAFTER enviado: ${correo_usuario}, ID: ${info.messageId}`
    );

    return {
      success: true,
      messageId: info.messageId,
      message: 'EXPIRADO TEAM CRAFTER enviado correctamente',
    };
  } catch (error) {
    logger.error(`❌ Error al enviar el correo EXPIRADO TEAM CRAFTER:`, error);

    return {
      success: false,
      error: error.message,
      message: 'Error al enviar el correo EXPIRADO TEAM CRAFTER',
    };
  }
};
