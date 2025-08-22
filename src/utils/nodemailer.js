import nodemailer from 'nodemailer';
import { EMAIL, FRONTEND_URL, PASSWORD_EMAIL } from '../../config.js';

export const transporter = nodemailer.createTransport({
  host: 'mail.team-crafter.com', // tu servidor SMTP
  port: 465, // puerto seguro
  secure: true, // true porque usas 465
  auth: {
    user: EMAIL, // ventas@team-crafter.com
    pass: PASSWORD_EMAIL, // contraseña del correo
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error al conectar con el servidor de correo:', error);
  } else {
    console.log('Conexión exitosa con el servidor de correo');
  }
});

export const sendConfirmationEmail = async (
  nombre,
  correo,
  verificationLink
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
            <img src="https://i.ibb.co/4YF1hzT/team-crafter-logo.png" alt="Team Crafter" style="max-width: 200px; height: auto;" />
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
                <a href="${FRONTEND_URL}/verificar-correo?token=${verificationLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f06292 0%, #e91e63 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; text-align: center;">
                   Click para verificar mi correo electronico
                </a>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div style="padding: 20px 30px; background-color: white; text-align: center; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.4;">
                Para asegurarte de seguir recibiendo estos correos electrónicos, agrega nuestro correo electrónico a tu libreta de direcciones. 
                <a href="#" style="color: #f06292; text-decoration: underline;">Darse de baja</a>
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
    console.log(`📩 Correo enviado a: ${correo}, ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Error al enviar el correo electrónico:`, error);
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
            <img src="https://i.ibb.co/4YF1hzT/team-crafter-logo.png" alt="Team Crafter" style="max-width: 200px; height: auto;" />
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
                <a href="#" style="color: #f06292; text-decoration: underline;">Darse de baja</a>
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
    console.log(
      `🔐 Correo de recuperación enviado a: ${correo}, ID: ${info.messageId}`
    );

    return {
      success: true,
      messageId: info.messageId,
      message: 'Correo de recuperación enviado exitosamente',
    };
  } catch (error) {
    console.error(`❌ Error al enviar el correo de recuperación:`, error);

    return {
      success: false,
      error: error.message,
      message: 'Error al enviar el correo de recuperación',
    };
  }
};
