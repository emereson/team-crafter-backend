import express from 'express';

import * as comentarioForoMiddleware from '../comentarioForo/comentarioForo.middleware.js';
import * as respuestaComentarioForoController from './respuestaComentarioForo.controllers.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

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

// router
//   .use(
//     '/:id',
//     respuestaComentarioClaseMiddleware.validExistRespuestaComentarioClase
//   )
//   .route('/:id');
// .patch(comentarioController.updateClase)
// .delete(comentarioController.deleteClase)
// .get(comentarioController.findOne);

export { router as respuestaComentarioForoRouter };
