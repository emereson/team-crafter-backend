import express from 'express';
import * as favoritoController from './favorito.controllers.js';
import * as claseMiddleware from '../../modulesClases/clase/clase.middleware.js';
import * as authMiddleware from '../user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

// GET /like-clase -> traer todos los likes del usuario
router.get('/', favoritoController.findAll);

// POST y DELETE /like-clase/:id
router
  .route('/:id')
  .post(claseMiddleware.validExistClase, favoritoController.create)
  .delete(claseMiddleware.validExistClase, favoritoController.deleteLikeClase);

export { router as favoritoRouter };
