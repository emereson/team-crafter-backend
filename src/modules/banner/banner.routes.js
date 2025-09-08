import express from 'express';
import * as bannerMiddleware from './banner.middleware.js';
import * as bannerController from './banner.controllers.js';
import * as authMiddleware from '../usuario/user/auth.middleware.js';
import * as authAdminMiddleware from '../admins/adminAuth.middleware.js';
import { uploadImage } from '../../utils/multer.js';

const router = express.Router();

router.get('/usuario', authMiddleware.protect, bannerController.findAll);
router.use(authAdminMiddleware.protect);
router.get('/', bannerController.findAll);

router.post('/', uploadImage.single('img'), bannerController.create);

router
  .use('/:id', bannerMiddleware.validExistBanner)
  .route('/:id')
  .patch(uploadImage.single('img'), bannerController.update)
  .delete(bannerController.deleteBanner)
  .get(bannerController.findOne);

export { router as bannerRouter };
