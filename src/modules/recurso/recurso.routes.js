import express from 'express';

import * as recursoController from './recurso.controllers.js';
import * as recursoMiddleware from './recurso.middleware.js';

import * as authMiddleware from '../usuario/user/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware.protect);

router.get('/', recursoController.findAll);
router.post(
  '/expirado/:id',
  recursoMiddleware.validExistRecurso,
  recursoController.expirado
);

// Rutas para un recurso específico

export { router as recursoRouter };
