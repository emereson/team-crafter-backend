import express from 'express';

import * as recursoController from './recurso.controllers.js';
import * as authMiddleware from '../usuario/user/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware.protect);

router.get('/', recursoController.findAll);

// Rutas para un recurso específico

export { router as recursoRouter };
