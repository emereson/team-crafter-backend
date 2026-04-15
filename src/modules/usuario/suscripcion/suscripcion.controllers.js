import { Suscripcion } from './suscripcion.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Plan } from '../../plan/plan.model.js';
import { User } from '../user/user.model.js';
import cron from 'node-cron';
import { AppError } from '../../../utils/AppError.js';
import {
  cancelSubscriptionPayPal,
  getSubscriptionPayPal,
  reviseSubscriptionPayPal,
} from '../../../services/paypal.service.js';
import logger from '../../../utils/logger.js';
import { Op, fn, col, literal } from 'sequelize';
import {
  cancelarSuscripcionFlow,
  retryInvoice,
  suscripcionId,
} from '../../../services/flow.service.js';

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
      startDate: {
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
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

  const lastDayOfMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
    23,
    59,
    59,
    999,
  );

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
          startDate: {
            [Op.between]: [firstDayOfMonth, lastDayOfMonth],
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
  limpiarSuscripcionesDuplicadas();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

  const lastDayOfMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
    23,
    59,
    59,
    999,
  );

  // 2. Ingresos y conteo total mensual
  const stats = await Suscripcion.findOne({
    attributes: [
      [fn('SUM', col('precio')), 'totalRevenue'],
      [fn('COUNT', col('id')), 'totalSubs'],
    ],
    where: {
      status: 'activa',
      startDate: {
        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
      },
    },
    raw: true,
  });

  // 3. Usuarios únicos usando 'user_id' (filtrado también por el mes actual)
  const totalUsers = await Suscripcion.count({
    distinct: true,
    col: 'user_id',
    where: {
      status: 'activa',
      startDate: {
        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
      },
    },
  });

  // 4. Extra: Últimas 5 suscripciones (se mantiene igual, traerá las más recientes)
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

export const crearSuscripcionPaypal = catchAsync(async (req, res) => {
  const { sessionUser, plan } = req;
  const { paypalSubscriptionId } = req.body;

  const suscripcionActiva = await Suscripcion.findOne({
    where: {
      user_id: sessionUser.id,
      suscripcion_id_paypal: paypalSubscriptionId,
    },
  });

  if (suscripcionActiva) {
    return res.status(200).json({
      status: 'success',
      // link_pago: resPayal.links[0].href,
    });
  }
  let resPayal = null;

  if (paypalSubscriptionId) {
    resPayal = await getSubscriptionPayPal({
      subscription_id: paypalSubscriptionId,
    });
  }

  const start = new Date(resPayal.start_time);
  const end = new Date(start);

  if (plan.id === 1) {
    end.setMonth(end.getMonth() + 1);
  } else if (plan.id === 2) {
    end.setMonth(end.getMonth() + 6);
  } else if (plan.id === 3) {
    end.setMonth(end.getMonth() + 12);
  } else if (plan.id === 4) {
    end.setMonth(end.getMonth() + 1);
  }

  await Suscripcion.create({
    user_id: sessionUser.id,
    customerId: sessionUser.customerId,
    plan_id: plan.id,
    suscripcion_id_paypal: paypalSubscriptionId,
    precio: plan.precio_plan,
    status: resPayal.status === 'ACTIVE' ? 'activa' : 'pendiente',
    startDate: start,
    endDate: end,
  });

  return res.status(200).json({
    status: 'success',
    // link_pago: resPayal.links[0].href,
  });
});

export const obtenerContenidoPremium = catchAsync(async (req, res) => {
  const { sessionUser } = req;

  // 1. Buscamos suscripciones que el sistema cree que están vigentes
  let suscripciones = await Suscripcion.findAll({
    where: {
      user_id: sessionUser.id,
      status: ['pendiente', 'activa'],
    },
    order: [['createdAt', 'DESC']],
  });

  let suscripcionActiva = null;

  // 2. Si existen, validamos su estado real con el proveedor (PayPal/Flow)
  for (const suscripcion of suscripciones) {
    const esValida = await verificarValidezSuscripcion(suscripcion);

    if (esValida === 1 || esValida === 'ACTIVE') {
      suscripcionActiva = await suscripcion.update({ status: 'activa' });
      break;
    } else if (esValida === 4 || esValida === 'CANCELLED') {
      await suscripcion.update({ status: 'cancelada' });
    } else if (esValida === 0 || esValida === 'INACTIVE') {
      await suscripcion.update({ status: 'expirada' });
    }
  }

  // 3. SI NO HAY ACTIVA: Verificamos si Flow tiene facturas pagadas que no hemos registrado
  if (!suscripcionActiva) {
    const ultimaSuscripcion = await Suscripcion.findOne({
      where: { user_id: sessionUser.id, status: 'expirada' },

      order: [['createdAt', 'DESC']],
    });

    if (ultimaSuscripcion?.flow_subscription_id) {
      const resFlow = await suscripcionId({
        subscriptionId: ultimaSuscripcion.flow_subscription_id,
      });

      const invoices = resFlow.invoices || [];

      for (const invoice of invoices) {
        // Solo nos interesan facturas PAGADAS (status 1 en Flow)
        if (invoice.status !== 1) continue;

        const fechaInicio = new Date(invoice.period_start);
        // Normalizamos a medianoche para comparar con la DB
        fechaInicio.setUTCHours(0, 0, 0, 0);

        const fechaFinal = new Date(invoice.period_end);
        fechaFinal.setUTCHours(0, 0, 0, 0);

        // ¿Ya registramos este periodo en nuestra DB?
        const existSuscripcion = await Suscripcion.findOne({
          where: {
            flow_subscription_id: ultimaSuscripcion.flow_subscription_id,
            startDate: fechaInicio,
          },
        });

        if (!existSuscripcion) {
          // Si no existe y está pagada en Flow, creamos el nuevo periodo
          suscripcionActiva = await Suscripcion.create({
            user_id: ultimaSuscripcion.user_id,
            plan_id: ultimaSuscripcion.plan_id,
            precio: ultimaSuscripcion.precio,
            status: 'activa',
            startDate: fechaInicio,
            endDate: fechaFinal,
            flow_subscription_id: ultimaSuscripcion.flow_subscription_id,
          });

          break;
        } else if (existSuscripcion.status === 'activa') {
          suscripcionActiva = existSuscripcion;
          break;
        }
      }
    }
  }

  return res.status(200).json({
    status: 'success',
    suscripcionActiva,
    tieneAcceso: Boolean(suscripcionActiva),
  });
});
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
    // 1. Verificación con PayPal
    if (suscripcion.suscripcion_id_paypal) {
      const resPaypal = await getSubscriptionPayPal({
        subscription_id: suscripcion.suscripcion_id_paypal,
      });
      return resPaypal.status;
    }

    // 2. Verificación con Flow
    if (suscripcion.flow_subscription_id) {
      const resFlow = await suscripcionId({
        subscriptionId: suscripcion.flow_subscription_id,
      });

      const isActiva = resFlow.status === 1;

      // Buscamos si hay alguna factura pendiente usando Optional Chaining por seguridad
      const pendiente = resFlow.invoices?.find((i) => i.status === 0);

      // Solo intentamos cobrar si EFECTIVAMENTE hay una factura pendiente
      if (pendiente?.id) {
        try {
          const retry = await retryInvoice({ invoiceId: pendiente.id });

          // Si el reintento funcionó y se pagó (asumiendo que status 1 es pagado)
          if (retry?.status === 1) {
            return 1; // Suscripción válida/activa
          }
        } catch (retryError) {
          logger.error(
            '❌ Error al intentar cobrar factura atrasada:',
            retryError,
          );
          // Si falla el cobro, no detenemos la función, dejamos que devuelva el estado real abajo
        }
      }

      // Evaluamos el estado final a devolver
      if (!isActiva) {
        return 4; // 4 = Estado inactivo o cancelado (según tu lógica anterior)
      }

      // Si está activa, devolvemos morose si existe, o 1 (activa) por defecto
      return resFlow.morose ? resFlow.morose : 1;
    }

    // Si no tiene ningún proveedor, considerar como inválida
    return 4;
  } catch (error) {
    logger.error('❌ Error al verificar suscripción:', error);
    return 4;
  }
};

export const inicializarCronSuscripciones = () => {
  // Se ejecuta todos los días a las 00:00 (Medianoche)
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info(
        '⏳ [CRON] Verificando y actualizando suscripciones expiradas...',
      );

      const fechaActual = new Date();

      const [updatedRows] = await Suscripcion.update(
        { status: 'expirada' },
        {
          where: {
            status: 'activa', // Solo busca las que siguen marcadas como activas
            endDate: {
              [Op.lt]: fechaActual, // Que su endDate sea menor a hoy
            },
          },
        },
      );

      if (updatedRows > 0) {
        logger.info(
          `✅ [CRON] Éxito: Se marcaron ${updatedRows} suscripciones como expiradas.`,
        );
      } else {
        logger.info(
          '✅ [CRON] Todo al día: No se encontraron suscripciones expiradas hoy.',
        );
      }
    } catch (error) {
      logger.error('❌ [CRON] Error al actualizar suscripciones:', error);
    }
  });

  logger.info('⚙️  Cron job de suscripciones inicializado correctamente.');
};

export const limpiarSuscripcionesDuplicadas = async () => {
  try {
    // 1. Buscamos a los usuarios con el problema (la misma consulta de antes)
    const usuariosDuplicados = await Suscripcion.findAll({
      attributes: ['user_id'],
      where: { status: 'activa' },
      group: ['user_id'],
      having: literal('COUNT(id) > 1'),
      raw: true,
    });

    let totalDesactivadas = 0;

    // 2. Arreglamos a cada usuario uno por uno
    for (const usuario of usuariosDuplicados) {
      // Obtenemos todas sus suscripciones activas, ordenadas de la más NUEVA a la más VIEJA
      const suscripciones = await Suscripcion.findAll({
        where: {
          user_id: usuario.user_id,
          status: 'activa',
        },
        order: [['createdAt', 'DESC']],
      });

      // El índice 0 es la más nueva, esa la dejamos quieta.
      // Empezamos el bucle desde el índice 1 para cancelar todas las anteriores.
      for (let i = 1; i < suscripciones.length; i++) {
        await suscripciones[i].update({ status: 'cancelada' }); // o 'expirada'
        totalDesactivadas++;
      }
    }
  } catch (error) {
    logger.error('❌ Error limpiando duplicados:', error);
  }
};
