import { db } from './src/config/mysql.js';
import { app } from './src/app.js';
// ❌ no importamos PORT desde config
import initModel from './src/config/initModel.js';
import logger from './src/utils/logger.js';
import { transporter } from './src/utils/nodemailer.js';

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
    return initModel();
  })
  .then(() => {
    return db.sync();
  })
  .then(() => {
    return transporter.verify((error, success) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Conexión exitosa con el servidor de correo');
      }
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });
