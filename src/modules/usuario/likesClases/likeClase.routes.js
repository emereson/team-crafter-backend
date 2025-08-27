import express from 'express';
import * as likeClaseController from './likeClase.controllers.js';
import * as claseMiddleware from '../../modulesClases/clase/clase.middleware.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

// GET /like-clase -> traer todos los likes del usuario
router.get('/', likeClaseController.findAll);

// POST y DELETE /like-clase/:id
router
  .route('/:id')
  .post(claseMiddleware.validExistClase, likeClaseController.create)
  .delete(claseMiddleware.validExistClase, likeClaseController.deleteLikeClase);

export { router as likeClaseRouter };
