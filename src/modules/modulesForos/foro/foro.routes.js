import express from 'express';
import * as foroController from './foro.controllers.js';
import * as foroMiddleware from './foro.middleware.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';
import { uploadImage } from '../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', foroController.findAll);
router.post('/', uploadImage.single('img'), foroController.create);

router
  .use('/:id', foroMiddleware.validExistForo)
  .route('/:id')
  .patch(foroController.update)
  .delete(foroController.deleteForo)
  .get(foroController.findOne);

export { router as foroRouter };
