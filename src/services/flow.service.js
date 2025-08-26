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

export const createPaymentOrder = async ({
  userEmail,
  orderId,
  amount,
  subject,
}) => {
  const params = {
    apiKey: FLOW_API_KEY,
    commerceOrder: String(orderId),
    subject: subject,
    currency: 'USD',
    amount: amount,
    email: userEmail,
    paymentMethod: '9',
    urlConfirmation:
      'https://end-point.team-crafter.com/api/v1/suscripcion/confirmacion',
    urlReturn: 'https://dashboard.team-crafter.com/compra-completada',
  };

  // generar firma
  const s = signParams(params);

  // transformar params a string seguro
  const formData = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
    s,
  });

  try {
    const response = await axios.post(
      `${FLOW_URL}/payment/create`,
      formData.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { url, token } = response.data;
    return { redirectUrl: `${url}?token=${token}` };
  } catch (err) {
    console.error(
      '❌ Error en createPaymentOrder:',
      err.response?.data || err.message
    );
    throw err;
  }
};

export const getPaymentStatus = async (token) => {
  const params = { apiKey: FLOW_API_KEY, token };
  const s = signParams(params);

  const query = new URLSearchParams({ ...params, s }).toString();
  const response = await axios.get(`${FLOW_URL}/payment/getStatus?${query}`);
  return response.data;
};
