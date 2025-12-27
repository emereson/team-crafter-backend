import express from 'express';
import * as comentarioMiddleware from '../comentarioClase/comentarioClase.middleware.js';
import * as respuestaComentarioClaseMiddleware from './respuestaComentarioClase.middleware.js';
import * as respuestaComentarioClaseController from './respuestaComentarioClase.controllers.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.use(authAdminMiddleware.protect);

router.get(
  '/:id',
  comentarioMiddleware.validExistComentarioClase,
  respuestaComentarioClaseController.findAll
);
router.post(
  '/:id',
  comentarioMiddleware.validExistComentarioClase,
  respuestaComentarioClaseController.create
);

router
  .use(
    '/:id',
    respuestaComentarioClaseMiddleware.validExistRespuestaComentarioClase
  )
  .route('/:id')
  // .patch(comentarioController.updateClase)
  .delete(respuestaComentarioClaseController.deleteItem);
// .get(comentarioController.findOne);

export { router as respuestaComentarioClaseAdminRouter };
