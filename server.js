import { db } from './src/db/mysql.js';
import { app } from './src/app.js';
import { PORT } from './config.js';
import { actualizarSuscripcionesExpiradas } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';
import initModel from './src/db/initModel.js';
server.setTimeout(10 * 60 * 1000);

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
    const server = app.listen(PORT, () => {
      console.log(`🚀 App running on port ${PORT}`);
    });

    // aumenta el timeout del servidor (10 minutos)
    server.setTimeout(10 * 60 * 1000);
  })
  .catch((err) => {
    console.error('❌ Error connecting to the database:', err);
  });
