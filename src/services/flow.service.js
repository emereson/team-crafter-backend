import crypto from 'node:crypto';
import axios from 'axios';
import { FLOW_API_KEY, FLOW_SECRET } from '../../config.js';

const FLOW_URL = 'https://sandbox.flow.cl/api';
// const FLOW_URL = 'https://www.flow.cl/api';

/**
 * Genera firma HMAC-SHA256
 */
function signParams(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHmac('sha256', FLOW_SECRET).update(sorted).digest('hex');
}

export const createPlanFlow = async ({
  planId,
  name,
  amount,
  interval_count,
}) => {
  const params = {
    apiKey: FLOW_API_KEY,
    planId: planId,
    name: name,
    amount: amount,
    currency: 'USD',
    interval: 3,
    interval_count: interval_count,
  };

  Object.keys(params).forEach(
    (k) => params[k] === undefined && delete params[k]
  );

  const s = signParams(params);

  const formData = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
    s,
  });

  try {
    const response = await axios.post(
      `${FLOW_URL}/plans/create`,
      formData.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
  } catch (err) {
    console.error(
      '❌ Error en createPlanFlow:',
      err.response?.data || err.message
    );
    throw err;
  }
};

export const createCustomerFlow = async ({ name, email, external_id }) => {
  const params = {
    apiKey: FLOW_API_KEY,
    name: name,
    email: email,
    externalId: external_id,
  };

  const s = signParams(params);
  const formData = new URLSearchParams({ ...params, s });

  try {
    const response = await axios.post(
      `${FLOW_URL}/customer/create`,
      formData.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('✅ Cliente creado en Flow:', response.data);
    return response.data;
  } catch (err) {
    // Si el cliente ya existe, Flow devuelve un error específico.
    // Puedes manejarlo para no detener el flujo.
    if (err.response?.data?.code === 2210) {
      console.log('ℹ️  Cliente ya existe en Flow, continuando...');
      // Puedes optar por obtener los datos del cliente si lo necesitas.
      return { customerId, name, email };
    }
    console.error(
      '❌ Error en createCustomerFlow:',
      err.response?.data || err.message
    );
    throw err;
  }
};

export const createSubscriptionFlow = async ({
  planId,
  customerId,
  subscription_start,
}) => {
  const params = {
    apiKey: FLOW_API_KEY,
    planId: planId,
    customerId: customerId,
    subscription_start: subscription_start,
  };

  const s = signParams(params);

  const formData = new URLSearchParams({ ...params, s });

  try {
    const response = await axios.post(
      `${FLOW_URL}/subscription/create`,
      formData.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    // La respuesta contiene la URL y el token para redirigir al usuario
    console.log(
      '✅ Suscripción creada. Redirigiendo al usuario a la página de pago...'
    );
    console.log(response.data);

    return response.data; // Devuelve un objeto { url, token }
  } catch (err) {
    console.error(
      '❌ Error en createSubscriptionFlow:',
      err.response?.data || err.message
    );
    throw err.response?.data || err;
  }
};

export const createInvoiceForSubscription = async ({
  customerId,
  email,
  commerceOrder,
  subject,
  amount,
}) => {
  const params = {
    apiKey: FLOW_API_KEY,
    customerId,
    commerceOrder,
    email,
    amount,
    subject,
    forward_times: 1,
    byEmail: 1,
    currency: 'USD',
    paymentMethod: 9,
    urlConfirmation:
      'https://end-point.team-crafter.com/api/v1/suscripcion/confirmacion',
    urlReturn:
      'https://end-point.team-crafter.com/api/v1/suscripcion/compra-completada',
  };

  const s = signParams(params);
  const formData = new URLSearchParams({ ...params, s });

  try {
    const response = await axios.post(
      `${FLOW_URL}/payment/create`,
      formData.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const data = response.data;
    const paymentUrl = `${data.url}?token=${data.token}`;

    console.log('✅ Factura creada. Link de pago:', paymentUrl);

    return { ...data, paymentUrl };
  } catch (err) {
    console.error(
      '❌ Error en createInvoiceForSubscription:',
      err.response?.data || err.message
    );
    throw err.response?.data || err;
  }
};

export const getPaymentStatus = async (token) => {
  const params = { apiKey: FLOW_API_KEY, token };
  const s = signParams(params);

  const query = new URLSearchParams({ ...params, s }).toString();
  const response = await axios.get(`${FLOW_URL}/payment/getStatus?${query}`);
  return response.data;
};
