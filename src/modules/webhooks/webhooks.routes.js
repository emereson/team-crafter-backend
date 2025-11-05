import express from 'express';
import * as paypalWebhookController from './paypalWebhook.controller.js';
import * as flowWebhookController from './flowWebhook.controller.js';

import bodyParser from 'body-parser';

const router = express.Router();

router.post(
  '/paypal',
  bodyParser.raw({ type: 'application/json' }),
  paypalWebhookController.paypalWebhook
);
router.post(
  '/fow',
  express.urlencoded({ extended: false }), // Flow envía datos en x-www-form-urlencoded
  flowWebhookController.recibirWebhookFlow
);

export { router as webhookRouter };
