import axios from 'axios';
import { MP_ACCESS_TOKEN } from '../../config.js';
import logger from '../utils/logger.js';

const MP_URL = 'https://api.mercadopago.com';

export const createPlanMP = async ({ name, amount, interval_count }) => {
  const planBody = {
    reason: name,
    auto_recurring: {
      frequency: interval_count || 1,
      frequency_type: 'months',
      transaction_amount: amount,
      currency_id: 'PEN',
    },
    // billing_day_proportional: true,
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
//   name: 'Plan Pro Crafter 6',
//   amount: 35,
//   interval_count: 1,
// });

export const createSubscriptionMP = async ({
  planId,
  reason,
  payer_email,
  card_token_id,
  user_id,
  start,
  end,
  transaction_amount,
}) => {
  const now = new Date();
  const startDate = now.toISOString();

  const subscriptionBody = {
    preapproval_plan_id: 'ffe828aa222949258136595e36302f06',
    reason: reason,
    payer_email: payer_email,
    card_token_id: card_token_id,
    external_reference: user_id,
    status: 'authorized',
    auto_recurring: {
      transaction_amount: 35,
      start_date: startDate,
    },
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
