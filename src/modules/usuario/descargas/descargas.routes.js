import express from 'express';
import * as descargaController from './descargas.controllers.js';
import * as recursoMiddleware from '../../recurso/recurso.middleware.js';
import * as authMiddleware from '../user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

// GET /like-clase -> traer todos los likes del usuario
router.get('/', descargaController.findAll);

// POST y DELETE /like-clase/:id
router
  .route('/:id')
  .post(recursoMiddleware.validExistRecurso, descargaController.create);

export { router as descargasRouter };
