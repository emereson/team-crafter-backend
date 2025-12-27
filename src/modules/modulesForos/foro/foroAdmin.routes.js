import { upload } from '../../../utils/multer.js';
import express from 'express';
import * as foroController from './foro.controllers.js';
import * as foroMiddleware from './foro.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.use(authAdminMiddleware.protect);

router.get('/', foroController.findAll);
router.post('/', upload.single('img'), foroController.create);

router
  .use('/:id', foroMiddleware.validExistForo)
  .route('/:id')
  .patch(foroController.update)
  .delete(foroController.deleteForo)
  .get(foroController.findOne);

export { router as foroRouterAdmin };
