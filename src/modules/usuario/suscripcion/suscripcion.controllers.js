import { Suscripcion } from './suscripcion.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Plan } from '../../plan/plan.model.js';
import cron from 'node-cron';
import { User } from '../user/user.model.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';
// import {
//   cancelarSuscripcionFlow,
//   migrarPlanSuscripcion,
//   suscripcionId,
// } from '../../../services/flow.service.js';
import { AppError } from '../../../utils/AppError.js';
import {
  cancelSubscriptionPayPal,
  createSubscriptionPayPal,
  getSubscriptionPayPal,
  reviseSubscriptionPayPal,
} from '../../../services/paypal.service.js';
import logger from '../../../utils/logger.js';
import { Op, fn, col, literal } from 'sequelize';
import {
  createSubscriptionMP,
  suscripcionId,
} from '../../../services/mercadoPago.service.js';

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

export const findAnalytics = catchAsync(async (req, res) => {
  const { type, from, to } = req.query;

  if (!type || !from || !to) {
    return res.status(400).json({
      status: 'error',
      message: 'type, from y to son requeridos',
    });
  }

  let attributes = [];
  let group = [];
  let order = [];

  switch (type) {
    case 'day':
      attributes = [
        [fn('HOUR', col('createdAt')), 'label'],
        [fn('COUNT', col('id')), 'total'],
      ];
      group = [fn('HOUR', col('createdAt'))];
      order = [[literal('label'), 'ASC']];
      break;

    case 'week':
    case 'month':
      attributes = [
        [fn('DATE', col('createdAt')), 'label'],
        [fn('COUNT', col('id')), 'total'],
      ];
      group = [fn('DATE', col('createdAt'))];
      order = [[literal('label'), 'ASC']];
      break;

    case 'year':
      attributes = [
        [fn('MONTH', col('createdAt')), 'label'],
        [fn('COUNT', col('id')), 'total'],
      ];
      group = [fn('MONTH', col('createdAt'))];
      order = [[literal('label'), 'ASC']];
      break;

    default:
      return res.status(400).json({
        status: 'error',
        message: 'Tipo de filtro inválido',
      });
  }

  const data = await Suscripcion.findAll({
    attributes,
    where: {
      status: 'activa',
      createdAt: {
        [Op.between]: [new Date(from), new Date(to)],
      },
    },
    group,
    order,
    raw: true,
  });

  return res.status(200).json({
    status: 'success',
    type,
    from,
    to,
    data,
  });
});
export const findPlanAllAnalytics = catchAsync(async (req, res, next) => {
  const currentYear = new Date().getFullYear();

  const planes = await Plan.findAll({
    attributes: ['id', 'nombre_plan', 'precio_plan'],
    where: {
      status: 'active',
    },
    include: [
      {
        model: Suscripcion,
        as: 'suscripciones',
        where: {
          status: 'activa',
          createdAt: {
            [Op.between]: [
              new Date(`${currentYear}-01-01 00:00:00`),
              new Date(`${currentYear}-12-31 23:59:59`),
            ],
          },
        },
        required: false, // LEFT JOIN
      },
    ],
  });

  return res.status(200).json({
    status: 'success',
    year: currentYear,
    planes: planes.map((plan) => ({
      planId: plan.id,
      plan: plan.nombre_plan,
      precio: plan.precio_plan,
      total: Number(plan.suscripciones.length),
    })),
  });
});

// Añadir al controlador de suscripciones
export const getDashboardStats = catchAsync(async (req, res) => {
  const currentYear = new Date().getFullYear();

  // 1. Ingresos y conteo total (Usando nombres correctos del modelo)
  const stats = await Suscripcion.findOne({
    attributes: [
      [fn('SUM', col('precio')), 'totalRevenue'],
      [fn('COUNT', col('id')), 'totalSubs'],
    ],
    where: {
      status: 'activa',
      createdAt: {
        [Op.between]: [
          new Date(`${currentYear}-01-01 00:00:00`),
          new Date(`${currentYear}-12-31 23:59:59`),
        ],
      },
    },
    raw: true,
  });

  // 2. Usuarios únicos usando 'user_id' (como está en tu modelo)
  const totalUsers = await Suscripcion.count({
    distinct: true,
    col: 'user_id',
    where: { status: 'activa' },
  });

  // 3. Extra: Últimas 5 suscripciones para llenar el dashboard
  const recentSubscriptions = await Suscripcion.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    where: { status: 'activa' },
    include: [{ model: User, as: 'usuario' }],
  });

  return res.status(200).json({
    status: 'success',
    data: {
      revenue: Number(stats?.totalRevenue || 0),
      subscriptions: Number(stats?.totalSubs || 0),
      users: totalUsers,
      recent: recentSubscriptions,
    },
  });
});

export const crearSuscripcion = catchAsync(async (req, res) => {
  const { sessionUser, plan } = req;
  const { reason, payer_email, card_token_id } = req.body;
  console.log(req.body);

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

  const resSuscription = await createSubscriptionMP({
    planId: plan.mercado_pago_id,
    reason,
    payer_email: payer_email || sessionUser.correo,
    card_token_id,
    user_id: sessionUser.id,
  });

  let suscripcion;

  if (resSuscription) {
    suscripcion = await Suscripcion.create({
      user_id: sessionUser.id,
      customerId: sessionUser.customerId,
      plan_id: plan.id,
      suscripcion_mp_id: resSuscription.id,
      precio: plan.precio_plan_soles,
      status: 'pendiente',
    });
  }

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

export const obtenerContenidoPremium = catchAsync(async (req, res) => {
  const { sessionUser } = req;

  const suscripciones = await Suscripcion.findAll({
    where: {
      user_id: sessionUser.id,
    },
    order: [['createdAt', 'DESC']],
  });

  // sadd
  let suscripcionActiva = null;

  for (const suscripcion of suscripciones) {
    const esValida = await verificarValidezSuscripcion(suscripcion);

    console.log(esValida);

    if (esValida === 'authorized' || esValida === 'ACTIVE') {
      suscripcionActiva = await suscripcion.update({ status: 'activa' });

      break; // ⛔ CORTA el loop
    }
    if (esValida === 'cancelled' || esValida === 'INACTIVE') {
      await suscripcion.update({ status: 'expirada' });
    } else {
      await suscripcion.update({ status: 'pendiente' });
    }
  }

  return res.status(200).json({
    status: 'success',
    suscripcionActiva,
    tieneAcceso: Boolean(suscripcionActiva),
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
          400,
        ),
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
        new AppError('Ocurrió un error al cancelar la suscripción.', 500),
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
        new AppError('Ocurrió un error al cancelar la suscripción.', 500),
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

      return resPaypal.status;
    }

    // Si tiene ID de Flow, verificar con Flow
    if (suscripcion.suscripcion_mp_id) {
      const resFlow = await suscripcionId({
        subscription_id: suscripcion.suscripcion_mp_id,
      });

      return resFlow.status;
    }

    // Si no tiene ningún proveedor, considerar como inválida
    return false;
  } catch (error) {
    logger.error('Error al verificar suscripción:', error);
    return false;
  }
};
