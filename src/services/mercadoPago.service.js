import axios from 'axios';
import { MP_ACCESS_TOKEN } from '../../config.js';
import logger from '../utils/logger.js';

const MP_URL = 'https://api.mercadopago.com';

export const createPlanMP = async ({ name, amount, interval_count }) => {
  console.log(interval_count);

  const planBody = {
    reason: name,
    auto_recurring: {
      frequency: interval_count || 1,
      frequency_type: 'months',
      transaction_amount: amount,
      currency_id: 'PEN',
    },
    back_url: 'https://app.team-crafter.com/compra-completada',
    status: 'active',
  };

  try {
    const response = await axios.post(`${MP_URL}/preapproval_plan`, planBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    console.log(response.data);
    return response.data;
  } catch (err) {
    // Mercado Pago suele devolver errores muy detallados en response.data
    console.error(
      '❌ Error en createPlanMP:',
      err.response?.data || err.message,
    );
    throw err;
  }
};
// createPlanMP({
//   name: 'Plan Pro Crafter',
//   amount: 192,
//   interval_count: 12,
// });

export const createSubscriptionMP = async ({
  planId,
  reason,
  payer_email,
  card_token_id,
  user_id,
}) => {
  // Construimos el body con los datos mínimos obligatorios
  // para atar un usuario a un plan existente
  const subscriptionBody = {
    preapproval_plan_id: planId,
    reason: reason,
    payer_email: payer_email,
    card_token_id: card_token_id,
    external_reference: user_id,
    back_url: 'https://app.team-crafter.com/compra-completada',
  };

  try {
    // CORRECCIÓN: El endpoint correcto en Mercado Pago es /preapproval
    const response = await axios.post(
      `${MP_URL}/preapproval`,
      subscriptionBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      },
    );

    return response.data;
  } catch (err) {
    console.error(
      '❌ Error en createSubscriptionMP:',
      err.response?.data || err.message,
    );
    throw err.response?.data || err;
  }
};

// export const createInvoiceForSubscription = async ({
//   planId,
//   customerId,
//   subscription_start,
// }) => {
//   const params = {
//     apiKey: MP_URL,
//     planId,
//     customerId,
//     subscription_start,
//   };

//   const s = signParams(params);
//   const formData = new URLSearchParams({ ...params, s });

//   try {
//     const response = await axios.post(
//       `${MP_URL}/subscription/create`,
//       formData.toString(),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
//     );

//     const data = response.data;
//     const paymentUrl = `${data.url}?token=${data.token}`;

//     return { ...data, paymentUrl };
//   } catch (err) {
//     logger.error(
//       '❌ Error en createInvoiceForSubscription:',
//       err.response?.data || err.message,
//     );
//     throw err.response?.data || err;
//   }
// };

// export const listadoSuscripciones = async ({ customerId }) => {
//   const params = {
//     apiKey: MP_URL,
//     customerId,
//   };

//   const s = signParams(params);
//   const queryString = new URLSearchParams({ ...params, s }).toString();

//   try {
//     const response = await axios.get(
//       `${MP_URL}/customer/getSubscriptions?${queryString}`,
//     );

//     return response.data;
//   } catch (err) {
//     logger.error('❌ Error :', err.response?.data || err.message);
//     throw err.response?.data || err;
//   }
// };

export const suscripcionId = async ({ subscription_id }) => {
  console.log('Consultando suscripción MP:', subscription_id);

  try {
    const response = await axios.get(
      `${MP_URL}/preapproval/${subscription_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      },
    );

    console.log(response.data);
    return response.data;
  } catch (err) {
    logger.error(
      '❌ Error en suscripcionId:',
      err.response?.data || err.message,
    );
    throw err.response?.data || err;
  }
};

// export const datosCliente = async ({ customerId }) => {
//   const params = {
//     apiKey: MP_URL,
//     customerId,
//   };

//   const s = signParams(params);
//   const queryString = new URLSearchParams({ ...params, s }).toString();

//   try {
//     const response = await axios.get(`${MP_URL}/customer/get?${queryString}`);

//     return response.data;
//   } catch (err) {
//     logger.error('❌ Error :', err.response?.data || err.message);
//     throw err.response?.data || err;
//   }
// };

// export const invoiceGet = async ({ invoiceId }) => {
//   const params = {
//     apiKey: MP_URL,
//     invoiceId,
//   };

//   const s = signParams(params);
//   const queryString = new URLSearchParams({ ...params, s }).toString();

//   try {
//     const response = await axios.get(`${MP_URL}/invoice/get?${queryString}`);

//     return response.data;
//   } catch (err) {
//     logger.error('❌ Error :', err.response?.data || err.message);
//     throw err.response?.data || err;
//   }
// };

// export const migrarPlanSuscripcion = async ({ subscriptionId, newPlanId }) => {
//   const params = {
//     apiKey: MP_URL,
//     subscriptionId,
//     newPlanId,
//   };

//   const s = signParams(params);
//   const formData = new URLSearchParams({ ...params, s });

//   try {
//     const response = await axios.post(
//       `${MP_URL}/subscription/changePlan`,
//       formData.toString(),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
//     );

//     return response.data;
//   } catch (err) {
//     logger.error('❌ Error :', err.response?.data || err.message);
//     throw err.response?.data || err;
//   }
// };

// export const cancelarSuscripcionFlow = async ({ subscriptionId }) => {
//   const params = {
//     apiKey: MP_URL,
//     subscriptionId,
//   };

//   const s = signParams(params);
//   const formData = new URLSearchParams({ ...params, s });

//   try {
//     const response = await axios.post(
//       `${MP_URL}/subscription/cancel`,
//       formData.toString(),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
//     );

//     return response.data;
//   } catch (err) {
//     logger.error('❌ Error :', err.response?.data || err.message);
//     throw err.response?.data || err;
//   }
// };
