import { Suscripcion } from './suscripcion.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Plan } from '../../plan/plan.model.js';
import cron from 'node-cron';
import { Op } from 'sequelize';
import { User } from '../user/user.model.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';
import {
  cancelarSuscripcionFlow,
  migrarPlanSuscripcion,
  suscripcionId,
} from '../../../services/flow.service.js';
import { AppError } from '../../../utils/AppError.js';
import {
  cancelSubscriptionPayPal,
  createSubscriptionPayPal,
  getSubscriptionPayPal,
  reviseSubscriptionPayPal,
} from '../../../services/paypal.service.js';
import logger from '../../../utils/logger.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const suscripciones = await Suscripcion.findAll({
    where: {
      user_id: sessionUser.id,
      status: {
        [Op.or]: ['activa', 'expirada', 'cancelada'],
      },
    },
    order: [['id', 'desc']],
  });

  return res.status(200).json({
    status: 'success',
    suscripciones,
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

export const crearSuscripcionPaypal = catchAsync(async (req, res) => {
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

  const resPayal = await createSubscriptionPayPal({
    plan_id: plan.paypal_plan_id,
    custom_id: sessionUser.id,
    given_name: sessionUser.nombre,
    email_address: sessionUser.correo,
  });

  await Suscripcion.create({
    user_id: sessionUser.id,
    customerId: sessionUser.customerId,
    plan_id: plan.id,
    suscripcion_id_paypal: resPayal.id,
    precio: plan.precio_plan,
    status: 'pendiente',
  });

  return res.status(200).json({
    status: 'success',
    link_pago: resPayal.links[0].href,
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
        contenido: `La suscripción al plan ${suscripcion.plan.nombre_plan} expiró el día ${suscripcion.endDate}.`,
      });
    }
  });
};
// Acceso a contenido premium
export const obtenerContenidoPremium = catchAsync(async (req, res) => {
  const { sessionUser } = req;

  // Buscar suscripción activa del usuario
  const suscripcion = await Suscripcion.findOne({
    where: {
      user_id: sessionUser.id,
      status: 'activa',
    },
  });

  // Si no hay suscripción activa, retornar respuesta inmediata
  if (!suscripcion) {
    return res.status(200).json({
      status: 'success',
      suscripcionActiva: null,
      sessionUser,
    });
  }

  // Verificar estado de la suscripción según el proveedor
  const esValida = await verificarValidezSuscripcion(suscripcion);

  // Si la suscripción no es válida, actualizar estado
  if (!esValida) {
    await suscripcion.update({ status: 'expirada' });
  }

  return res.status(200).json({
    status: 'success',
    suscripcionActiva: esValida ? suscripcion : null,
    sessionUser,
  });
});

/**
 * Verifica si una suscripción sigue siendo válida
 * según su proveedor de pago (PayPal o Flow)
 */

export const migrarPlan = catchAsync(async (req, res, next) => {
  const { suscripcion } = req;
  const { planExternalId } = req.body;

  const plan = await Plan.findOne({
    where: {
      id: planExternalId,
    },
  });

  if (!plan) {
    return next(new AppError(`El plan es obligatorio`, 400));
  }

  const start = new Date(suscripcion.startDate);
  const end = new Date(start);

  if (plan.id === 1) {
    end.setMonth(end.getMonth() + 1);
  } else if (plan.id === 2) {
    end.setMonth(end.getMonth() + 6);
  } else if (plan.id === 3) {
    end.setMonth(end.getMonth() + 12);
  }

  if (suscripcion.suscripcion_id_paypal) {
    const resPaypal = await reviseSubscriptionPayPal({
      subscription_id: suscripcion.suscripcion_id_paypal,
      new_plan_id: plan.paypal_plan_id,
    });

    return res.status(200).json({
      status: 'success',
      link_pago: resPaypal.links[0].href,
    });
  }

  if (suscripcion.flow_subscription_id) {
    try {
      const response = await migrarPlanSuscripcion({
        subscriptionId: suscripcion.flow_subscription_id,
        newPlanId: plan.flow_plan_id,
      });
      await suscripcion.update({
        status: 'activa',
        startDate: start,
        endDate: end,
        plan_id: plan.id,
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
  }
});

export const cancelarSuscripcion = catchAsync(async (req, res, next) => {
  const { suscripcion } = req;

  if (suscripcion.suscripcion_id_paypal) {
    try {
      // 🔹 Cancelar en PayPal
      await cancelSubscriptionPayPal({
        subscription_id: suscripcion.suscripcion_id_paypal,
      });

      // 🔹 Actualizar estado local (por ejemplo, con Sequelize)
      await suscripcion.update({
        status: 'cancelada',
        endDate: new Date(),
      });

      return res.status(200).json({
        status: 'success',
        message: 'Suscripción cancelada correctamente.',
      });
    } catch (error) {
      return next(
        new AppError('Ocurrió un error al cancelar la suscripción.', 500)
      );
    }
  }

  if (suscripcion.flow_subscription_id) {
    try {
      await cancelarSuscripcionFlow({
        subscriptionId: suscripcion.flow_subscription_id,
      });

      await suscripcion.update({
        status: 'cancelada',
        endDate: new Date(),
      });

      return res.status(200).json({
        status: 'success',
        message: 'Suscripción cancelada correctamente.',
      });
    } catch (error) {
      return next(
        new AppError('Ocurrió un error al cancelar la suscripción.', 500)
      );
    }
  }
});

const verificarValidezSuscripcion = async (suscripcion) => {
  try {
    // Si tiene ID de PayPal, verificar con PayPal
    if (suscripcion.suscripcion_id_paypal) {
      const resPaypal = await getSubscriptionPayPal({
        subscription_id: suscripcion.suscripcion_id_paypal,
      });
      return resPaypal.status === 'ACTIVE';
    }

    // Si tiene ID de Flow, verificar con Flow
    if (suscripcion.flow_subscription_id) {
      const resFlow = await suscripcionId({
        subscription_id: suscripcion.flow_subscription_id,
      });
      return resFlow.status === 1;
    }

    // Si no tiene ningún proveedor, considerar como inválida
    return false;
  } catch (error) {
    logger.error('Error al verificar suscripción:', error);
    return false;
  }
};
