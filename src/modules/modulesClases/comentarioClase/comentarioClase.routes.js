import express from 'express';
import * as comentarioMiddleware from './comentarioClase.middleware.js';
import * as comentarioController from './comentarioClase.controllers.js';
import * as claseMiddleware from '../clase/clase.middleware.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/:id',
  claseMiddleware.validExistClase,
  comentarioController.findAll
);
router.post(
  '/:id',
  claseMiddleware.validExistClase,
  comentarioController.create
);

router
  .use('/:id', comentarioMiddleware.validExistComentarioClase)
  .route('/:id');
// .patch(comentarioController.updateClase)
// .delete(comentarioController.deleteClase)
// .get(comentarioController.findOne);

const comentarioClaseRouter = router;

export { comentarioClaseRouter };
