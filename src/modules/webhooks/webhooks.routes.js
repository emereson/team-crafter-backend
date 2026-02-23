import express from 'express';
import * as paypalWebhookController from './paypalWebhook.controller.js';
import * as flowWebhookController from './mpWebhook.controller.js';

import bodyParser from 'body-parser';

const router = express.Router();

router.post(
  '/paypal',
  bodyParser.raw({ type: 'application/json' }),
  paypalWebhookController.paypalWebhook,
);
router.post('/mercadopago', flowWebhookController.webhookMercadoPago);

export { router as webhookRouter };
