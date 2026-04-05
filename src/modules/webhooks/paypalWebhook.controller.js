import axios from 'axios';
import { PAYPAL_BASE_URL, PAYPAL_WEBHOOK_ID } from '../../../config.js';
import { getAccessTokenPaypal } from '../../services/paypal.service.js';
import { Suscripcion } from '../usuario/suscripcion/suscripcion.model.js';
import { Plan } from '../plan/plan.model.js';
import logger from '../../utils/logger.js';

const webhookID = PAYPAL_WEBHOOK_ID;

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
  // 🛡️ Agregamos el order DESC para asegurarnos de actualizar siempre la fila más reciente
  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
    order: [['createdAt', 'DESC']],
  });

  if (!suscripcionActual) {
    logger.warn(`⚠️ Suscripción PayPal ${subscriptionId} no encontrada`);
    return;
  }

  await suscripcionActual.update({ status: nuevoEstado });
  logger.info(
    `✅ Suscripción ${subscriptionId} actualizada a "${nuevoEstado}"`,
  );
}

/**
 * 📌 Maneja pagos completados (Diferenciando compra inicial de renovaciones)
 */
async function crearNuevaRenovacion(event) {
  const subscriptionId =
    event.resource.billing_agreement_id || event.resource.id;

  // 1. Buscamos la suscripción original
  const suscripcionActual = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscriptionId },
    order: [['createdAt', 'DESC']],
  });

  if (!suscripcionActual) {
    logger.warn(`⚠️ No se encontró suscripción base para (${subscriptionId})`);
    return;
  }

  // 2. EL FILTRO DE 5 MINUTOS (Evita duplicados en la compra inicial)
  const ahora = new Date();
  const fechaCreacionBase = new Date(suscripcionActual.createdAt);
  const diferenciaMinutos = (ahora - fechaCreacionBase) / (1000 * 60);

  if (diferenciaMinutos < 5) {
    logger.info(
      `ℹ️ El pago de ${subscriptionId} es la compra inicial. Ignorando creación duplicada.`,
    );

    // Por seguridad, si el controlador 'resultadoPaypal' falló, la activamos aquí
    if (suscripcionActual.status !== 'activa') {
      await suscripcionActual.update({ status: 'activa' });
    }
    return; // Detenemos la ejecución. NO se crea fila nueva.
  }

  // 3. SI PASÓ EL FILTRO, ES UNA RENOVACIÓN REAL (Meses después)
  logger.info(
    `🔄 Procesando renovación real para la suscripción ${subscriptionId}`,
  );

  // Apagamos la suscripción del mes viejo
  await suscripcionActual.update({ status: 'expirada' });

  // Calculamos las fechas del nuevo ciclo
  const plan = await Plan.findByPk(suscripcionActual.plan_id);

  const start = new Date();
  const end = new Date(start);

  if (plan && plan.id === 1) end.setMonth(end.getMonth() + 1);
  else if (plan && plan.id === 2) end.setMonth(end.getMonth() + 6);
  else if (plan && plan.id === 3) end.setMonth(end.getMonth() + 12);
  else end.setMonth(end.getMonth() + 1); // Fallback de 1 mes por defecto

  // Creamos la nueva fila para el nuevo mes
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

  logger.info(
    `🔁 Renovación exitosa. Nueva suscripción creada: ${nuevaSuscripcion.id}`,
  );
}
