import crypto from 'node:crypto';
import { FLOW_SECRET } from '../../../config.js';
import { Suscripcion } from '../usuario/suscripcion/suscripcion.model.js';
import logger from '../../utils/logger.js';

/**
 * Verifica firma HMAC-SHA256 enviada por Flow
 */
function verificarFirmaFlow(params) {
  const { s, ...rest } = params;
  const sorted = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('&');

  const expected = crypto
    .createHmac('sha256', FLOW_SECRET)
    .update(sorted)
    .digest('hex');

  return expected === s;
}

/**
 * Webhook principal para recibir notificaciones de Flow
 */
export const recibirWebhookFlow = async (req, res) => {
  try {
    const data = req.body;
    logger.info('📩 Webhook recibido de Flow:', data);

    // 1️⃣ Verificar firma
    const isValid = verificarFirmaFlow(data);
    if (!isValid) {
      console.warn('⚠️ Firma inválida en webhook Flow');
      return res.status(400).send('Invalid signature');
    }

    const {
      event,
      subscriptionId,
      customerId,
      planId,
      period_start,
      period_end,
      status,
      amount, // Flow envía el monto pagado
    } = data;

    // 2️⃣ Buscar última suscripción de este cliente
    const suscripcionActual = await Suscripcion.findOne({
      where: { flow_subscription_id: subscriptionId },
      order: [['createdAt', 'DESC']],
    });

    // 3️⃣ Lógica según tipo de evento
    switch (event) {
      case 'subscription.renewed':
        logger.info(`🔁 Renovación detectada para ${subscriptionId}`);

        // Crear una nueva fila de suscripción (para el historial)
        await Suscripcion.create({
          user_id: suscripcionActual?.user_id, // heredamos del registro anterior
          customerId,
          plan_id: suscripcionActual?.plan_id || null,
          plan_id_flow: planId || suscripcionActual?.plan_id_flow,
          flow_subscription_id: subscriptionId,
          precio: suscripcionActual?.precio || amount || 0,
          status: 'activa',
          startDate: period_start,
          endDate: period_end,
        });

        logger.info(
          `🆕 Nueva suscripción creada por renovación: ${subscriptionId}`
        );
        break;

      case 'subscription.canceled':
        if (suscripcionActual) {
          await suscripcionActual.update({
            status: 'cancelada',
            motivo_cancelacion: 'Cancelada por el usuario o Flow',
            fecha_cancelacion: new Date(),
          });
          logger.info(`❌ Suscripción ${subscriptionId} cancelada`);
        }
        break;

      case 'subscription.expired':
        if (suscripcionActual) {
          await suscripcionActual.update({ status: 'expirada' });
          logger.info(`⚠️ Suscripción ${subscriptionId} expirada`);
        }
        break;

      case 'payment.success':
        logger.info(`💰 Pago exitoso de la suscripción ${subscriptionId}`);
        break;

      default:
        logger.info(`ℹ️ Evento Flow no manejado: ${event}`);
    }

    return res.status(200).send('OK');
  } catch (error) {
    logger.error('❌ Error procesando webhook Flow:', error);
    return res.status(500).send('Server error');
  }
};
