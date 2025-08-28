import express from 'express';
import * as claseMiddleware from './clase.middleware.js';
import * as claseController from './clase.controllers.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.use(authAdminMiddleware.protect);

router.post('/', claseController.createClase);
router.get('/', claseController.findAll);

router
  .use('/:id', claseMiddleware.validExistClase)
  .route('/:id')
  .patch(claseController.updateClase)
  .delete(claseController.deleteClase)
  .get(claseController.findOne);

export { router as claseAdminRouter };
