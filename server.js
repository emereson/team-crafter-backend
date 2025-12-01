import { db } from './src/config/mysql.js';
import { app } from './src/app.js';
import { PORT } from './config.js';
import { actualizarSuscripcionesExpiradas } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';
import initModel from './src/config/initModel.js';
import logger from './src/utils/logger.js';

async function startServer() {
  try {
    logger.info('⏳ Authenticating database...');
    await db.authenticate();
    logger.info('✅ Database authenticated!');

    logger.info('⏳ Initializing models...');
    await initModel();

    logger.info('⏳ Syncing database...');
    await db.sync();
    logger.info('✅ Database synced!');

    // Manejar errores dentro de esta función
    try {
      await actualizarSuscripcionesExpiradas();
    } catch (err) {
      logger.error('❌ Error en actualizarSuscripcionesExpiradas:', err);
    }

    // Crear servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 App running on port ${PORT}`);
    });

    // Timeout a 10 min
    server.setTimeout(10 * 60 * 1000);
  } catch (err) {
    logger.error('❌ Fatal error al iniciar el servidor:', err);
    process.exit(1);
  }
}

// Capturar errores globales
process.on('unhandledRejection', (reason) => {
  logger.error('🚨 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('🚨 Uncaught Exception:', err);
});

startServer();
