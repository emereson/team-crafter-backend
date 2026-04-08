import axios from 'axios';
import { PAYPAL_BASE_URL, PAYPAL_WEBHOOK_ID } from '../../../config.js';
import {
  getAccessTokenPaypal,
  getSubscriptionPayPal,
} from '../../services/paypal.service.js';
import { Suscripcion } from '../usuario/suscripcion/suscripcion.model.js';
import { Plan } from '../plan/plan.model.js';
import logger from '../../utils/logger.js';

const webhookID = PAYPAL_WEBHOOK_ID;

/**
 * 📌 Verifica que la petición realmente provenga de PayPal
 */
export async function verifyWebhookSignature(req) {
  try {
    const token = await getAccessTokenPaypal();
    const payload = req.body;
    const headers = req.headers;

    const body = {
      webhook_id: webhookID,
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_event: payload,
    };

    const { data } = await axios.post(
      `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return data.verification_status === 'SUCCESS';
  } catch (error) {
    logger.error(
      '❌ Error verificando firma PayPal:',
      error.response?.data || error.message,
    );
    return false;
  }
}

/**
 * 📌 Controlador Principal del Webhook
 */
export const paypalWebhook = async (req, res) => {
  try {
    const isValid = await verifyWebhookSignature(req);

    if (!isValid) {
      logger.warn('⚠️ Firma PayPal inválida.');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info('📦 Evento recibido de PayPal:', event.event_type);

    // Responder a PayPal lo más rápido posible con un 200 OK
    res.status(200).send('OK');

    // Procesamos el evento en segundo plano
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await activarOCrearSuscripcionWebhook(event.resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await actualizarSuscripcion(event.resource.id, 'cancelada');
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await actualizarSuscripcion(event.resource.id, 'suspendida');
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await actualizarSuscripcion(event.resource.id, 'expirada');
        break;

      case 'PAYMENT.SALE.COMPLETED':
      case 'BILLING.SUBSCRIPTION.RENEWED':
        await crearNuevaRenovacion(event);
        break;

      default:
        logger.info('ℹ️ Evento no manejado:', event.event_type);
    }
  } catch (err) {
    logger.error('❌ Error procesando webhook PayPal:', err);
    // Si ya enviamos el res.status(200) arriba, no volvemos a enviar respuesta
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error procesando webhook' });
    }
  }
};

/**
 * 📌 1. Activa la suscripción o la crea si el Webhook llegó antes que el Frontend (Móviles)
 */
async function activarOCrearSuscripcionWebhook(subscriptionId) {
  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
    order: [['createdAt', 'DESC']],
  });

  if (suscripcionActual) {
    // Si ya existe (creada por tu controlador frontend), solo aseguramos que esté activa
    if (suscripcionActual.status !== 'activa') {
      await suscripcionActual.update({ status: 'activa' });
      logger.info(
        `✅ Suscripción ${subscriptionId} actualizada a "activa" vía Webhook`,
      );
    }
    return;
  }

  // SI NO EXISTE: El webhook llegó primero. Debemos crearla.
  logger.info(
    `⚠️ Suscripción ${subscriptionId} no encontrada. Creando desde el Webhook...`,
  );

  try {
    // A. Consultar a PayPal para obtener los detalles completos, incluyendo el custom_id (tu user_id)
    const paypalSub = await getSubscriptionPayPal({
      subscription_id: subscriptionId,
    });
    const userId = paypalSub.custom_id;

    if (!userId) {
      logger.error(
        `❌ No se pudo crear suscripción. PayPal no devolvió custom_id para ${subscriptionId}. Revisa que el Frontend lo esté enviando.`,
      );
      return;
    }

    // B. Determinar el plan_id basándonos en el plan_id de PayPal
    const plan = await Plan.findOne({
      where: { paypal_id: paypalSub.plan_id },
    });

    if (!plan) {
      logger.error(
        `❌ Plan de PayPal ${paypalSub.plan_id} no encontrado en nuestra BD.`,
      );
      return;
    }

    // C. Calcular fechas
    const start = new Date(paypalSub.start_time);
    const end = new Date(start);

    if (plan.id === 1 || plan.id === 4) end.setMonth(end.getMonth() + 1);
    else if (plan.id === 2) end.setMonth(end.getMonth() + 6);
    else if (plan.id === 3) end.setMonth(end.getMonth() + 12);

    // D. Crear en la base de datos
    await Suscripcion.create({
      user_id: userId,
      plan_id: plan.id,
      precio: plan.precio_plan, // Asumiendo que esta es la columna de precio en tu Plan
      suscripcion_id_paypal: subscriptionId,
      status: 'activa',
      startDate: start,
      endDate: end,
    });

    logger.info(
      `✅ Suscripción ${subscriptionId} creada exitosamente desde el Webhook para el usuario ${userId}`,
    );
  } catch (error) {
    logger.error(`❌ Error creando suscripción desde Webhook:`, error);
  }
}

/**
 * 📌 2. Actualiza estado de una suscripción existente (Cancelaciones/Suspensiones)
 */
async function actualizarSuscripcion(subscriptionId, nuevoEstado) {
  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
    order: [['createdAt', 'DESC']],
  });

  if (!suscripcionActual) {
    logger.warn(
      `⚠️ Suscripción PayPal ${subscriptionId} no encontrada para actualizar a ${nuevoEstado}`,
    );
    return;
  }

  await suscripcionActual.update({ status: nuevoEstado });
  logger.info(
    `✅ Suscripción ${subscriptionId} actualizada a "${nuevoEstado}"`,
  );
}

/**
 * 📌 3. Maneja pagos completados (Diferenciando compra inicial de renovaciones)
 */
async function crearNuevaRenovacion(event) {
  const subscriptionId =
    event.resource.billing_agreement_id || event.resource.id;

  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
    order: [['createdAt', 'DESC']],
  });

  if (!suscripcionActual) {
    logger.warn(
      `⚠️ No se encontró suscripción base para (${subscriptionId}) al intentar renovar.`,
    );
    return;
  }

  // EL FILTRO DE 5 MINUTOS (Evita duplicados en la compra inicial)
  const ahora = new Date();
  const fechaCreacionBase = new Date(suscripcionActual.createdAt);
  const diferenciaMinutos = (ahora - fechaCreacionBase) / (1000 * 60);

  if (diferenciaMinutos < 5) {
    logger.info(
      `ℹ️ El pago de ${subscriptionId} es la compra inicial. Ignorando creación de renovación.`,
    );
    if (suscripcionActual.status !== 'activa') {
      await suscripcionActual.update({ status: 'activa' });
    }
    return;
  }

  // SI PASÓ EL FILTRO, ES UNA RENOVACIÓN REAL (Meses después)
  logger.info(
    `🔄 Procesando renovación real para la suscripción ${subscriptionId}`,
  );

  // Apagamos la suscripción del mes viejo
  await suscripcionActual.update({ status: 'expirada' });

  // Calculamos las fechas del nuevo ciclo
  const plan = await Plan.findByPk(suscripcionActual.plan_id);

  const start = new Date();
  const end = new Date(start);

  if (plan && (plan.id === 1 || plan.id === 4))
    end.setMonth(end.getMonth() + 1);
  else if (plan && plan.id === 2) end.setMonth(end.getMonth() + 6);
  else if (plan && plan.id === 3) end.setMonth(end.getMonth() + 12);
  else end.setMonth(end.getMonth() + 1);

  // Creamos la nueva fila para el nuevo mes
  const nuevaSuscripcion = await Suscripcion.create({
    user_id: suscripcionActual.user_id,
    customerId: suscripcionActual.customerId, // Si es undefined no pasa nada, se adapta a tu modelo
    plan_id: suscripcionActual.plan_id,
    suscripcion_id_paypal: subscriptionId,
    precio: suscripcionActual.precio,
    startDate: start,
    endDate: end,
    status: 'activa',
  });

  logger.info(
    `🔁 Renovación exitosa. Nueva suscripción creada: ${nuevaSuscripcion.id}`,
  );
}
