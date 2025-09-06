import { db } from './src/config/mysql.js';
import { app } from './src/app.js';
import { PORT } from './config.js';
import { actualizarSuscripcionesExpiradas } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';
import initModel from './src/config/initModel.js';

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

    // Aquí creas el server y aumentas el timeout
    const server = app.listen(PORT, () => {
      console.log(`🚀 App running on port ${PORT}`);
    });

    // Aumentar tiempo de espera a 10 minutos
    server.setTimeout(10 * 60 * 1000);
  })
  .catch((err) => {
    console.error('❌ Error connecting to the database:', err);
  });
