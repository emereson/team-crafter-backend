import { db } from './src/config/mysql.js';
import { app } from './src/app.js';
// ❌ no importamos PORT desde config
import initModel from './src/config/initModel.js';
import logger from './src/utils/logger.js';

// ✅ Puerto dinámico (obligatorio en producción)
const PORT = process.env.PORT || 3010;

async function startServer() {
  try {
    // 1️⃣ Autenticar DB
    await db.authenticate();
    logger.info('✅ Database authenticated!');

    // 2️⃣ Inicializar modelos y asociaciones
    await initModel();

    // 3️⃣ Sincronizar tablas
    await db.sync();
    logger.info('✅ Database synced!');

    // 4️⃣ Levantar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 App running on port ${PORT}`);
    });

    // 5️⃣ Aumentar timeout (10 minutos)
    server.setTimeout(10 * 60 * 1000);

    // 6️⃣ Manejo de cierre correcto (evita SIGTERM brusco)
    process.on('SIGTERM', () => {
      logger.warn('🛑 SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        logger.info('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.warn('🛑 SIGINT recibido. Cerrando servidor...');
      server.close(() => {
        logger.info('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();
