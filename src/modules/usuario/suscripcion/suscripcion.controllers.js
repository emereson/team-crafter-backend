import { Suscripcion } from './suscripcion.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import {
  createInvoiceForSubscription,
  createSubscriptionFlow,
  getPaymentStatus,
} from '../../../services/flow.service.js';
import { Plan } from '../../plan/plan.model.js';
import cron from 'node-cron';
import { Op } from 'sequelize';
import { User } from '../user/user.model.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';

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

  const now = new Date();
  const startDate = now.toISOString().split('T')[0];

  const suscripcionFlow = await createSubscriptionFlow({
    planId: plan.flow_plan_id,
    customerId: sessionUser.customerId,
    subscription_start: startDate,
  });

  const suscripcion = await Suscripcion.create({
    user_id: sessionUser.id,
    plan_id: plan.id,
    precio: plan.precio_plan,
    flow_subscription_id: suscripcionFlow.subscriptionId,
    status: 'pendiente',
  });

  const payment = await createInvoiceForSubscription({
    customerId: sessionUser.customerId,
    email: sessionUser.correo,
    commerceOrder: suscripcion.id,
    subject: plan.nombre_plan,
    amount: plan.precio_plan,
  });
  return res.status(200).json({
    status: 'success',
    suscripcion,
    payment,
  });
});

// Confirmar pago
export const confirmarPago = catchAsync(async (req, res) => {
  const { token } = req.body;

  const infoPago = await getPaymentStatus(token);

  if (infoPago.status === 2) {
    const suscripcion = await Suscripcion.findOne({
      where: { id: Number(infoPago.commerceOrder) },
      include: [{ model: Plan, as: 'plan' }],
    });

    if (!suscripcion || !suscripcion.plan) {
      return res
        .status(404)
        .json({ error: 'Suscripción o plan no encontrado' });
    }

    const startDate = new Date();
    let endDate = new Date(startDate);

    switch (suscripcion.plan.id) {
      case 1:
        endDate.setDate(endDate.getDate() + 30);
        break;
      case 2:
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 3:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Antes de activar, cancelar cualquier suscripción pendiente o activa
    await Suscripcion.update(
      { status: 'cancelada' },
      {
        where: {
          user_id: suscripcion.user_id,
          status: { [Op.in]: ['pendiente', 'activa'] },
          id: { [Op.ne]: suscripcion.id },
        },
      }
    );

    await suscripcion.update({
      status: 'activa',
      startDate,
      endDate,
    });
  } else {
    await Suscripcion.update(
      { status: 'cancelada' },
      { where: { id: Number(infoPago.commerceOrder) } }
    );
  }

  return res.json({ status: 'ok' });
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
  const userId = req.sessionUser?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autorizado' });
  }

  const suscripcion = await Suscripcion.findOne({
    where: { user_id: userId, status: 'activa' },
    include: [
      { model: Plan, as: 'plan' },
      { model: User, as: 'usuario' },
    ],
  });

  if (!suscripcion) {
    return res.status(403).json({ error: 'No tienes una suscripción activa' });
  }

  if (suscripcion.endDate && suscripcion.endDate < new Date()) {
    await suscripcion.update({ status: 'expirada' });
    return res.status(403).json({ error: 'Tu suscripción ha expirado' });
  }

  res.json({ msg: '🎉 Acceso a contenido premium', suscripcion });
});
