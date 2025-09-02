import { db } from './src/db/mysql.js';
import { app } from './src/app.js';
import { PORT } from './config.js';
import { actualizarSuscripcionesExpiradas } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';
import initModel from './src/db/initModel.js';

db.authenticate()
  .then(() => {
    console.log(`✅ Database authenticated!`);
    return initModel(); // Inicializa los modelos y asociaciones
  })
  .then(() => {
    return db.sync(); // Sincroniza tablas
  })
  .then(() => {
    console.log(`✅ Database synced!`);
    actualizarSuscripcionesExpiradas(); // Inicia el cron
    app.listen(PORT, () => {
      console.log(`🚀 App running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error connecting to the database:', err);
  });
