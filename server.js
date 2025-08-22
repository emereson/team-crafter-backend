import { db } from './src/db/mysql.js';
import { app } from './src/app.js';
import { PORT } from './config.js';
import { actualizarSuscripcionesExpiradas } from './src/modules/usuario/suscripcion/suscripcion.controllers.js';

db.authenticate()
  .then(() => {
    console.log(`Database Synced 💪`);
    app.listen(PORT, () => {
      console.log(`App Running on Port ${PORT}`);
    });
  })
  .then(() => {
    actualizarSuscripcionesExpiradas();
    console.log(`Database Authenticated! 👍`);
    // return initModel();
  })
  .then(() => {
    return db.sync();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });
