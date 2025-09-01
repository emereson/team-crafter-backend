import express from 'express';
import * as configNotificacionesController from './configNotificaciones.controllers.js';
import * as authMiddleware from '../user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

router.get('/', configNotificacionesController.findNotificaction);
router.patch('/', configNotificacionesController.update);

export { router as configNotificacionesRouter };
