import express from 'express';
import * as likeForoClaseController from './likesForo.controllers.js';
import * as foroMiddleware from '../../modulesForos/foro/foro.middleware.js';
import * as authMiddleware from '../user/auth.middleware.js';

const router = express.Router();

// Protege todas las rutas
router.use(authMiddleware.protect);

// GET /like-clase -> traer todos los likes del usuario
router.get('/', likeForoClaseController.findAll);

// POST y DELETE /like-clase/:id
router
  .route('/:id')
  .post(foroMiddleware.validExistForo, likeForoClaseController.create)
  .delete(
    foroMiddleware.validExistForo,
    likeForoClaseController.deleteLikeForo
  );

export { router as likeForoRouter };
