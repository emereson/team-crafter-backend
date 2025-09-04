import { Suscripcion } from './suscripcion.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Plan } from '../../plan/plan.model.js';
import cron from 'node-cron';
import { Op } from 'sequelize';
import { User } from '../user/user.model.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';
import {
  datosCliente,
  listadoSuscripciones,
} from '../../../services/flow.service.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const suscripcionesFlow = await listadoSuscripciones({
    customerId: sessionUser.customerId,
  });

  const datosClientes = await datosCliente({
    customerId: sessionUser.customerId,
  });

  return res.status(200).json({
    status: 'success',
    suscripciones: suscripcionesFlow,
    datosClientes: datosClientes,
  });
});

export const crearSuscripcion = catchAsync(async (req, res) => {
  const { sessionUser, plan } = req;

  // Verificar si ya existe una suscripción activa
  const suscripcionActiva = await Suscripcion.findOne({
    where: {
      user_id: sessionUser.id,
      status: 'activa',
    },
  });

  if (suscripcionActiva) {
    return res.status(403).json({
      status: 'fail',
      message: 'Ya tienes una suscripción activa',
      suscripcion: suscripcionActiva,
    });
  }

  const suscripcion = await Suscripcion.create({
    user_id: sessionUser.id,
    customerId: sessionUser.customerId,
    plan_id: plan.id,
    plan_id_flow: plan.flow_plan_id,
    precio: plan.precio_plan,
    status: 'pendiente',
  });

  return res.status(200).json({
    status: 'success',
    suscripcion,
  });
});

// Cron job para actualizar suscripciones expiradas
export const actualizarSuscripcionesExpiradas = () => {
  cron.schedule('0 0 * * *', async () => {
    const hoy = new Date();
    const expiradas = await Suscripcion.findAll({
      where: {
        endDate: { [Op.lt]: hoy },
        status: 'activa',
      },
      include: [
        { model: User, as: 'usuario' },
        { model: Plan, as: 'plan' },
      ],
    });

    for (const suscripcion of expiradas) {
      await suscripcion.update({ status: 'expirada' });
      await Notificaciones.create({
        usuario_id: suscripcion.usuario.id,
        tipo_notificacion: 'noticias',
        titulo: `Tu suscripción  ${suscripcion.plan.nombre_plan} a expirado `,
        contenido: `La suscripción al plan ${
          suscripcion.plan.nombre_plan
        } expiró el día ${dayjs(suscripcion.endDate).format('DD/MM/YYYY')}.`,
      });
    }
  });
};

// Acceso a contenido premium
export const obtenerContenidoPremium = catchAsync(async (req, res) => {
  const { sessionUser } = req;

  if (!sessionUser.id) {
    return res.status(401).json({ error: 'Usuario no autorizado' });
  }

  const suscripcionesFlow = await listadoSuscripciones({
    customerId: sessionUser.customerId,
  });

  // const suscripcion = await Suscripcion.findOne({
  //   where: { user_id: userId, status: 'activa' },
  //   include: [
  //     { model: Plan, as: 'plan' },
  //     { model: User, as: 'usuario' },
  //   ],
  // });

  // if (!suscripcion) {
  //   return res.status(403).json({ error: 'No tienes una suscripción activa' });
  // }

  // if (suscripcion.endDate && suscripcion.endDate < new Date()) {
  //   await suscripcion.update({ status: 'expirada' });
  //   return res.status(403).json({ error: 'Tu suscripción ha expirado' });
  // }

  res.json({
    msg: '🎉 Acceso a contenido premium',
    suscripcion: suscripcionesFlow.data[0],
  });
});
