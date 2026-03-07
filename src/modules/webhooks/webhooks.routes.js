import express from 'express';
import * as paypalWebhookController from './paypalWebhook.controller.js';
import * as flowWebhookController from './mpWebhook.controller.js';

const router = express.Router();

// ✅ El middleware correcto: Parsea a JSON pero guarda una copia exacta (Raw)
const paypalParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8'); // Guardamos la copia exacta de PayPal
  },
});

// Aplicamos el parser SOLO a esta ruta
router.post('/paypal', paypalParser, paypalWebhookController.paypalWebhook);

router.post('/mercadopago', flowWebhookController.webhookMercadoPago);

export { router as webhookRouter };
