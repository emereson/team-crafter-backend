import { db } from './src/config/mysql.js';
import { app } from './src/app.js';
import { PORT } from './config.js';
// import { actualizarSuscripcionesExpiradas } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';
import initModel from './src/config/initModel.js';
import logger from './src/utils/logger.js';

db.authenticate()
  .then(() => {
    logger.info(`✅ Database authenticated!`);
    return initModel(); // Inicializa los modelos y asociaciones
  })
  .then(() => {
    return db.sync(); // Sincroniza tablas
  })
  .then(() => {
    logger.info(`✅ Database synced!`);
    // actualizarSuscripcionesExpiradas(); // Inicia el cron

    // Aquí creas el server y aumentas el timeout
    const server = app.listen(PORT, () => {
      logger.info(`🚀 App running on port ${PORT}`);
    });

    // Aumentar tiempo de espera a 10 minutos
    server.setTimeout(10 * 60 * 1000);
  })
  .catch((err) => {
    logger.error('❌ Error connecting to the database:', err);
  });
