import express from 'express';
import * as comentarioForoController from './comentarioForo.controllers.js';
import * as comentarioForoMiddleware from './comentarioForo.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';
import * as foroMiddleware from '../foro/foro.middleware.js';

const router = express.Router();

router.use(authAdminMiddleware.protect);

router.get('/:id', comentarioForoController.findAll);
router.post(
  '/foro/:id',
  foroMiddleware.validExistForo,
  comentarioForoController.create
);

router
  .use('/:id', comentarioForoMiddleware.validExistComentarioForo)
  .route('/:id')
  .patch(comentarioForoController.update)
  .delete(comentarioForoController.deleteComentarioForo)
  .get(comentarioForoController.findOne);

export { router as comentarioForoAdminRouter };
