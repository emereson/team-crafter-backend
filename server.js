import { db } from './src/config/mysql.js';
import { app } from './src/app.js';
// ❌ no importamos PORT desde config
import initModel from './src/config/initModel.js';
import logger from './src/utils/logger.js';
import { inicializarCronSuscripciones } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';

// ✅ Puerto dinámico (obligatorio en producción)
const PORT = process.env.PORT || 3010;

db.authenticate()
  .then(() => {
    logger.info(`Database Synced 💪`);
    app.listen(PORT, () => {
      logger.info(`App Running on Port ${PORT}`);
    });
  })
  .then(() => {
    logger.info(`Database Authenticated! 👍`);
    inicializarCronSuscripciones();
    return initModel();
  })
  .then(() => {
    return db.sync();
  })
  .catch((err) => {
    logger.error('Error connecting to the database:', err);
  });
