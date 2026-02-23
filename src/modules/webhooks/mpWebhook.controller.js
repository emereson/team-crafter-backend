import axios from 'axios';
import { Suscripcion } from '../usuario/suscripcion/suscripcion.model.js';
import { MP_ACCESS_TOKEN } from '../../../config.js';

export const webhookMercadoPago = async (req, res) => {
  // 1. REGLA DE ORO: Responder 200 OK inmediatamente a Mercado Pago
  res.status(200).send('Webhook recibido');

  // Extraemos qué tipo de evento nos está notificando MP
  const { type, data } = req.body;

  // 2. Procesamos en segundo plano (try/catch interno para no afectar el res.send anterior)
  try {
    // Escuchamos actualizaciones directas de la suscripción (Preapproval)
    if (type === 'subscription_preapproval' && data?.id) {
      const suscripcionMpId = data.id;

      // Buscamos si tenemos esa suscripción en estado 'pendiente' en nuestra BD
      const suscripcionDb = await Suscripcion.findOne({
        where: { suscripcion_mp_id: suscripcionMpId },
      });

      if (suscripcionDb && suscripcionDb.status === 'pendiente') {
        // Para mayor seguridad, le preguntamos a MP el estado real de esa suscripción
        const resMp = await axios.get(
          `https://api.mercadopago.com/preapproval/${suscripcionMpId}`,
          {
            headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
          },
        );

        const statusReal = resMp.data.status;

        // Si Mercado Pago nos confirma que está autorizada y el cobro pasó:
        if (statusReal === 'authorized') {
          await suscripcionDb.update({ status: 'activa' });
          console.log(
            `✅ ¡Suscripción ${suscripcionMpId} ACTIVADA en base de datos!`,
          );
        } else if (statusReal === 'cancelled') {
          await suscripcionDb.update({ status: 'cancelada' });
        }
      }
    }

    // OPCIONAL: Escuchar cuando ocurre el cobro (pago) específico
    if (type === 'payment' && data?.id) {
      const paymentId = data.id;
      // Aquí podrías consultar el endpoint /v1/payments/:id si necesitas
      // guardar los recibos (invoices) mensuales en tu base de datos.
      console.log(`💰 Nuevo pago procesado con ID: ${paymentId}`);
    }
  } catch (error) {
    // Solo lo registramos en consola, ya respondimos 200 a MP, así que no se colgará
    console.error('❌ Error procesando el Webhook de MP:', error.message);
  }
};
