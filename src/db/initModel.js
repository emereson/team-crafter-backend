import { Clase } from '../modules/modulesClases/clase/clase.model.js';
import { ComentarioClase } from '../modules/modulesClases/comentarioClase/comentarioClase.model.js';
import { RespuestaComentarioClase } from '../modules/modulesClases/respuestaComentarioClase/respuestaComentarioClase.model.js';
import { ComentarioForo } from '../modules/modulesForos/comentarioForo/comentarioForo.model.js';
import { Foro } from '../modules/modulesForos/foro/foro.model.js';
import { RespuestaComentarioForo } from '../modules/modulesForos/respuestaComentarioForo/respuestaComentarioForo.model.js';
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

  Foro.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario',
  });
  User.hasMany(Foro, {
    foreignKey: 'user_id',
    as: 'foros',
  });

  ComentarioForo.belongsTo(Foro, {
    foreignKey: 'foro_id',
    as: 'foro',
  });
  Foro.hasMany(ComentarioForo, {
    foreignKey: 'foro_id',
    as: 'comentarios_foro',
  });

  ComentarioForo.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario',
  });

  User.hasMany(ComentarioForo, {
    foreignKey: 'user_id',
    as: 'comentarios_foro',
  });

  RespuestaComentarioForo.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario',
  });
  User.hasMany(RespuestaComentarioForo, {
    foreignKey: 'user_id',
    as: 'respuesta_comentarios_foros',
  });

  RespuestaComentarioForo.belongsTo(ComentarioForo, {
    foreignKey: 'comentario_foro_id',
    as: 'comentario_foro',
  });
  ComentarioForo.hasMany(RespuestaComentarioForo, {
    foreignKey: 'comentario_foro_id',
    as: 'respuesta_comentarios_foros',
  });
}

export default initModel;
