import { Suscripcion } from './suscripcion.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Plan } from '../../plan/plan.model.js';
import cron from 'node-cron';
import { Op } from 'sequelize';
import { User } from '../user/user.model.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';
import {
  cancelarSuscripcionFlow,
  datosCliente,
  listadoSuscripciones,
  migrarPlanSuscripcion,
} from '../../../services/flow.service.js';
import { AppError } from '../../../utils/AppError.js';

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

  return res.status(200).json({
    status: 'success',
    suscripcion: suscripcionesFlow.data[0],
  });
});

export const migrarPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { planExternalId } = req.body;

  if (!planExternalId) {
    return next(new AppError(`El plan es obligatorio`, 400));
  }
  if (!id) {
    return next(new AppError(`La suscripción es obligatoria`, 400));
  }

  try {
    const response = await migrarPlanSuscripcion({
      subscriptionId: id,
      newPlanId: planExternalId,
    });

    return res.status(200).json({
      status: 'success',
      suscripcion: response,
    });
  } catch (err) {
    // Caso específico: factura pendiente
    return next(
      new AppError(
        'No puedes migrar de plan porque existe una factura pendiente de pago.',
        400
      )
    );
  }
});

export const cancelarSuscripcion = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const existSuscripcion = await Suscripcion.findOne({
    where: {
      flow_subscription_id: id,
    },
  });
  if (existSuscripcion) {
    existSuscripcion.update({ status: 'cancelada' });
  }
  existSuscripcion.save();
  if (!id) {
    return next(new AppError(`La suscripción es obligatoria`, 400));
  }

  try {
    const response = await cancelarSuscripcionFlow({
      subscriptionId: id,
    });

    return res.status(200).json({
      status: 'success',
      suscripcion: response,
    });
  } catch (err) {
    return next(
      new AppError(
        'No puedes migrar de plan porque existe una factura pendiente de pago.',
        400
      )
    );
  }
});
