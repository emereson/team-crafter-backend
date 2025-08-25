import express from 'express';
import * as comentarioMiddleware from '../comentarioClase/comentarioClase.middleware.js';
import * as respuestaComentarioClaseMiddleware from './respuestaComentarioClase.middleware.js';
import * as respuestaComentarioClaseController from './respuestaComentarioClase.controllers.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

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
  .route('/:id');
// .patch(comentarioController.updateClase)
// .delete(comentarioController.deleteClase)
// .get(comentarioController.findOne);

const respuestaComentarioClaseRouter = router;

export { respuestaComentarioClaseRouter };
