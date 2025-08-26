import nodemailer from 'nodemailer';
import { EMAIL, FRONTEND_URL, PASSWORD_EMAIL } from '../../config.js';

// Try multiple transporter configurations
const createTransporter = () => {
  // Configuration 1: Try with standard settings
  const config1 = {
    host: 'mail.team-crafter.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL,
      pass: PASSWORD_EMAIL,
    },
    connectionTimeout: 10000, // Reduced timeout
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
      servername: 'mail.team-crafter.com',
      ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
    },
    debug: true, // Enable debug mode
    logger: true,
  };

  // Configuration 2: Alternative port and settings
  const config2 = {
    host: 'mail.team-crafter.com',
    port: 587, // Try STARTTLS port
    secure: false,
    auth: {
      user: EMAIL,
      pass: PASSWORD_EMAIL,
    },
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
      servername: 'mail.team-crafter.com',
    },
    debug: true,
    logger: true,
  };

  // Configuration 3: Try with different TLS settings
  const config3 = {
    host: 'mail.team-crafter.com',
    port: 25, // Try standard SMTP port
    secure: false,
    auth: {
      user: EMAIL,
      pass: PASSWORD_EMAIL,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    ignoreTLS: false,
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  };

  // Try configurations in order
  const configs = [config1, config2, config3];
  let transporter = null;

  for (const config of configs) {
    try {
      transporter = nodemailer.createTransport(config);
      console.log(`Trying configuration with port ${config.port}...`);
      break;
    } catch (error) {
      console.error(`Failed with port ${config.port}:`, error.message);
      continue;
    }
  }

  return transporter || nodemailer.createTransport(config1);
};

export const transporter = createTransporter();

// Enhanced verification with better error handling
const verifyConnection = async () => {
  try {
    console.log('🔄 Verificando conexión SMTP...');

    // Set a timeout for the verification
    const verificationPromise = new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    // Add a timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Verification timeout')), 15000);
    });

    await Promise.race([verificationPromise, timeoutPromise]);
    console.log('✅ Conexión exitosa con el servidor de correo');
    return true;
  } catch (error) {
    console.error(
      '❌ Error al conectar con el servidor de correo:',
      error.message
    );

    // Provide specific troubleshooting suggestions
    if (error.code === 'ETIMEDOUT') {
      console.log('💡 Sugerencias para resolver el timeout:');
      console.log(
        '   1. Verificar que el servidor mail.team-crafter.com esté accesible'
      );
      console.log('   2. Comprobar configuración del firewall');
      console.log('   3. Intentar con puerto alternativo (587 o 25)');
      console.log('   4. Verificar credenciales de autenticación');
    }

    return false;
  }
};

// Call verification on startup
verifyConnection();

export const sendConfirmationEmail = async (
  nombre,
  correo,
  verificationLink
) => {
  try {
    // Check connection before sending
    const isConnected = await verifyConnection();
    if (!isConnected) {
      throw new Error('SMTP connection failed. Cannot send email.');
    }

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
                📧 Contacto directo: soporte@team-crafter.com
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
      from: `"Team Crafter" <${EMAIL}>`, // Better sender format
      to: correo,
      subject: '¡Bienvenido a Team Crafter! 🎉',
      html: emailBody,
    };

    // Add timeout to sendMail
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Send timeout after 30 seconds')),
        30000
      );
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`📩 Correo enviado a: ${correo}, ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Correo de confirmación enviado exitosamente',
    };
  } catch (error) {
    console.error(`❌ Error al enviar el correo electrónico:`, error);

    return {
      success: false,
      error: error.message,
      message: 'Error al enviar el correo de confirmación',
    };
  }
};

export const sendPasswordRecoveryEmail = async (
  nombre,
  correo,
  recoveryToken
) => {
  try {
    // Check connection before sending
    const isConnected = await verifyConnection();
    if (!isConnected) {
      throw new Error('SMTP connection failed. Cannot send email.');
    }

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
      from: `"Team Crafter" <${EMAIL}>`,
      to: correo,
      subject: '🔐 Restablece tu contraseña - Team Crafter',
      html: emailBody,
    };

    // Add timeout to sendMail
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Send timeout after 30 seconds')),
        30000
      );
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
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
