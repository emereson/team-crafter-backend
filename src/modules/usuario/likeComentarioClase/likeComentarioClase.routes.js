import express from 'express';
import * as likeComentarioClaseController from './likeComentarioClase.controllers.js';
import * as comentarioClaseController from '../../modulesClases/comentarioClase/comentarioClase.middleware.js';
import * as authMiddleware from '../user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

// GET /like-clase -> traer todos los likes del usuario
router.get('/', likeComentarioClaseController.findAll);

// POST y DELETE /like-clase/:id
router
  .route('/:id')
  .post(
    comentarioClaseController.validExistComentarioClase,
    likeComentarioClaseController.create
  )
  .delete(
    comentarioClaseController.validExistComentarioClase,
    likeComentarioClaseController.deleteLikeComentarioClases
  );

export { router as likeComentarioClaseRouter };
