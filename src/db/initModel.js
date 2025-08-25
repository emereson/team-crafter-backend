import { Clase } from '../modules/modulesClases/clase/clase.model.js';
import { ComentarioClase } from '../modules/modulesClases/comentarioClase/comentarioClase.model.js';
import { RespuestaComentarioClase } from '../modules/modulesClases/respuestaComentarioClase/respuestaComentarioClase.model.js';
import { Plan } from '../modules/plan/plan.model.js';
import { Recurso } from '../modules/recurso/recurso.model.js';
import { Suscripcion } from '../modules/usuario/suscripcion/suscripcion.model.js';
import { User } from '../modules/usuario/user/user.model.js';

function initModel() {
  Suscripcion.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
  Plan.hasMany(Suscripcion, { foreignKey: 'plan_id', as: 'suscripciones' });

  Suscripcion.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
  User.hasMany(Suscripcion, { foreignKey: 'user_id', as: 'suscripciones' });

  ComentarioClase.belongsTo(Clase, { foreignKey: 'clase_id', as: 'clase' });
  Clase.hasMany(ComentarioClase, {
    foreignKey: 'clase_id',
    as: 'comentarios',
  });

  ComentarioClase.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
  User.hasMany(ComentarioClase, {
    foreignKey: 'user_id',
    as: 'comentarios',
  });

  RespuestaComentarioClase.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario',
  });
  User.hasMany(RespuestaComentarioClase, {
    foreignKey: 'user_id',
    as: 'respuesta_comentarios',
  });

  Recurso.belongsTo(Clase, { foreignKey: 'clase_id', as: 'clase' });
  Clase.hasOne(Recurso, {
    foreignKey: 'clase_id',
    as: 'recurso',
  });
}

export default initModel;
