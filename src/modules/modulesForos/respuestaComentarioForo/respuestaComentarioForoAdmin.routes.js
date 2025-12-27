import express from 'express';

import * as comentarioForoMiddleware from '../comentarioForo/comentarioForo.middleware.js';
import * as respuestaComentarioForoController from './respuestaComentarioForo.controllers.js';
import * as respuestaComentarioClaseMiddleware from './respuestaComentarioForo.middleware.js';

import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.use(authAdminMiddleware.protect);

router.get(
  '/:id',
  comentarioForoMiddleware.validExistComentarioForo,
  respuestaComentarioForoController.findAll
);
router.post(
  '/:id',
  comentarioForoMiddleware.validExistComentarioForo,
  respuestaComentarioForoController.create
);

router
  .use(
    '/:id',
    respuestaComentarioClaseMiddleware.validExistRespuestaComentarioForo
  )
  .route('/:id')
  // .patch(respuestaComentarioForoController.updateClase)
  .delete(respuestaComentarioForoController.deleteItem);
// .get(respuestaComentarioForoController.findOne);

export { router as respuestaComentarioAdminForoRouter };
