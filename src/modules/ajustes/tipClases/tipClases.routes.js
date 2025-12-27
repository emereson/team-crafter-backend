import express from 'express';
import * as tipsClaseController from './tipClases.controllers.js';
import * as tipsClaseMiddleware from './tipClases.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.get('/', tipsClaseController.findAll);
router.use(authAdminMiddleware.protect);
router.post('/', tipsClaseController.create);

router
  .use('/:id', tipsClaseMiddleware.validExistTipClase)
  .route('/:id')
  .patch(tipsClaseController.update)
  .delete(tipsClaseController.deleteItem)
  .get(tipsClaseController.findOne);

export { router as tipsClaseRouter };
