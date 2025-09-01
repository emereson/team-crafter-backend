import express from 'express';

import * as likeComentarioForoController from './likeComentarioForo.controllers.js';
import * as comentarioForoMiddleware from '../../modulesForos/comentarioForo/comentarioForo.middleware.js';
import * as authMiddleware from '../user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

// GET /like-clase -> traer todos los likes del usuario
router.get('/', likeComentarioForoController.findAll);

// POST y DELETE /like-clase/:id
router
  .route('/:id')
  .post(
    comentarioForoMiddleware.validExistComentarioForo,
    likeComentarioForoController.create
  )
  .delete(
    comentarioForoMiddleware.validExistComentarioForo,
    likeComentarioForoController.deleteLikeComentarioForo
  );

export { router as likeComentarioForoRouter };
