import express from 'express';
import * as comentarioMiddleware from './comentarioClase.middleware.js';
import * as comentarioController from './comentarioClase.controllers.js';
import * as claseMiddleware from '../clase/clase.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.use(authAdminMiddleware.protect);

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
  .route('/:id')
  // .patch(comentarioController.updateClase)
  .delete(comentarioController.deleteItem);
// .get(comentarioController.findOne);

export { router as comentarioClaseAdminRouter };
