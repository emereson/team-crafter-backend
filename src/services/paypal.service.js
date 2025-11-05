import axios from 'axios';
import {
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_BASE_URL,
} from '../../config.js';
import logger from '../utils/logger.js';

/**
 * Genera el token de autenticación para PayPal
 */
export async function getAccessTokenPaypal() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const { data } = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    params,
    {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
    }
  );

  return data.access_token;
}

export const findAllProdctosPaypal = async () => {
  const token = await getAccessTokenPaypal();

  const { data } = await axios.get(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // PROD-0ER08354P8431933M

  return data; // Devuelve el plan creado
};

export const createProductPayPal = async ({ name, description }) => {
  const token = await getAccessTokenPaypal();

  const body = {
    name,
    description,
    type: 'DIGITAL',
    category: 'ARTS_CRAFTS_AND_COLLECTIBLES',
    home_url: 'https://team-crafter.com/',
  };

  const { data } = await axios.post(
    `${PAYPAL_BASE_URL}/v1/catalogs/products`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
    }
  );

  return data; // Devuelve el producto
};
// createProductPayPal({
//   name: 'Team Crafter Web',
//   description:
//     'Encuentra contenido exclusivo, clases y recursos para dar vida a tus proyectos de Papelería Creativa y Personalizados. A mayor tiempo suscrito accedes a más descargas.',
// });

export const createPlanPayPal = async ({
  product_id,
  name,
  amount,
  interval_unit = 'MONTH',
  interval_count = 1,
  currency = 'USD',
}) => {
  const token = await getAccessTokenPaypal();

  const body = {
    product_id,
    name,
    billing_cycles: [
      {
        frequency: {
          interval_unit,
          interval_count,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = infinito
        pricing_scheme: {
          fixed_price: {
            value: amount,
            currency_code: currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  };

  const { data } = await axios.post(
    `${PAYPAL_BASE_URL}/v1/billing/plans`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return data; // Devuelve el plan creado
};

// createPlanPayPal({
//   product_id: 'PROD-0ER08354P8431933M',
//   name: 'Plan Pro Crafter',
//   interval_count: 12,
//   amount: 55,
// });

export const createSubscriptionPayPal = async ({
  plan_id,
  custom_id,
  given_name,
  email_address,
}) => {
  const token = await getAccessTokenPaypal();

  const body = {
    plan_id,
    custom_id,
    subscriber: {
      name: {
        given_name,
      },
      email_address,
    },
    application_context: {
      brand_name: 'Team Crafter',
      user_action: 'SUBSCRIBE_NOW',
      return_url: 'http://localhost:3010/api/v1/user/resultado-paypal',
      cancel_url: 'http://localhost:3010/api/v1/user/resultado-paypal',
    },
  };

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // Devuelve un objeto { url, token }
  } catch (err) {
    logger.error(
      '❌ Error en createSubscription:',
      err.response?.data || err.message
    );
    throw err.response?.data || err;
  }
};

export const reviseSubscriptionPayPal = async ({
  subscription_id, // 👈 ID de la suscripción actual (ej: "I-XXXXXXX")
  new_plan_id, // 👈 ID del nuevo plan de PayPal
  return_url, // opcional
  cancel_url, // opcional
}) => {
  const token = await getAccessTokenPaypal();

  const body = {
    plan_id: new_plan_id,
    application_context: {
      brand_name: 'Team Crafter',
      user_action: 'SUBSCRIBE_NOW',
      return_url:
        return_url || 'http://localhost:3010/api/v1/user/migracion-paypal',
      cancel_url:
        cancel_url || 'http://localhost:3010/api/v1/user/migracion-paypal',
    },
  };

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscription_id}/revise`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // 👉 Devuelve un nuevo "approval_url"
  } catch (err) {
    logger.error(
      '❌ Error en reviseSubscriptionPayPal:',
      err.response?.data || err.message
    );
    throw err.response?.data || err;
  }
};

/**
 * Cancela una suscripción
 */
export const cancelSubscriptionPayPal = async ({ subscription_id }) => {
  const token = await getAccessTokenPaypal();

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscription_id}/cancel`,
      {
        reason: 'El usuario canceló su suscripción voluntariamente.',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // PayPal responde con 204 No Content cuando la cancelación es exitosa
    if (response.status === 204) {
      return { success: true, message: 'Suscripción cancelada exitosamente.' };
    }

    return { success: false, message: 'Cancelación no confirmada por PayPal.' };
  } catch (err) {
    logger.error(
      '❌ Error al cancelar suscripción PayPal:',
      err.response?.data || err.message
    );
    throw err.response?.data || err;
  }
};

/**
 * Obtiene información de una suscripción
 */
export const getSubscriptionPayPal = async ({ subscription_id }) => {
  const token = await getAccessTokenPaypal();

  const { data } = await axios.get(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscription_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

// getSubscriptionPayPal({ subscription_id: 'I-8CWF40VPDFSB' });
