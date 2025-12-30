import axios from 'axios';
import { PAYPAL_BASE_URL, PAYPAL_WEBHOOK_ID } from '../../../config.js';
import { getAccessTokenPaypal } from '../../services/paypal.service.js';
import { Suscripcion } from '../usuario/suscripcion/suscripcion.model.js';
import { Plan } from '../plan/plan.model.js';
import logger from '../../utils/logger.js';

const webhookID = PAYPAL_WEBHOOK_ID; // ⚠️ debe estar en tu .env

/**
 * ✅ Verifica la firma del webhook PayPal
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
      }
    );

    return data.verification_status === 'SUCCESS';
  } catch (error) {
    logger.error(
      '❌ Error verificando firma PayPal:',
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * 🧠 Procesa el evento webhook de PayPal
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

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await actualizarSuscripcion(event.resource.id, 'activa');
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
      case 'BILLING.SUBSCRIPTION.RENEWED': // algunos webhooks pueden llegar así
        await crearNuevaRenovacion(event);
        break;

      default:
        logger.info('ℹ️ Evento no manejado:', event.event_type);
    }

    res.status(200).send('OK');
  } catch (err) {
    logger.error('❌ Error procesando webhook PayPal:', err);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
};

/**
 * 📌 Actualiza estado de una suscripción existente
 */
async function actualizarSuscripcion(subscriptionId, nuevoEstado) {
  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
  });

  if (!suscripcionActual) {
    logger.warn(`⚠️ Suscripción PayPal ${subscriptionId} no encontrada`);
    return;
  }

  await suscripcionActual.update({ status: nuevoEstado });
  logger.info(
    `✅ Suscripción ${subscriptionId} actualizada a "${nuevoEstado}"`
  );
}

/**
 * 🔁 Crea una nueva suscripción cuando se renueva el pago automáticamente
 */
async function crearNuevaRenovacion(event) {
  const subscriptionId =
    event.resource.billing_agreement_id || event.resource.id;

  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
  });

  if (!suscripcionActual) {
    logger.warn(
      `⚠️ No se encontró suscripción para renovación (${subscriptionId})`
    );
    return;
  }

  const plan = await Plan.findByPk(suscripcionActual.plan_id);

  const start = new Date();
  const end = new Date(start);

  if (plan.id === 1) end.setMonth(end.getMonth() + 1);
  else if (plan.id === 2) end.setMonth(end.getMonth() + 6);
  else if (plan.id === 3) end.setMonth(end.getMonth() + 12);

  const nuevaSuscripcion = await Suscripcion.create({
    user_id: suscripcionActual.user_id,
    customerId: suscripcionActual.customerId,
    plan_id: suscripcionActual.plan_id,
    suscripcion_id_paypal: subscriptionId,
    precio: suscripcionActual.precio,
    startDate: start,
    endDate: end,
    status: 'activa',
  });

  logger.info(`🔁 Nueva suscripción creada: ${nuevaSuscripcion.id}`);
}
