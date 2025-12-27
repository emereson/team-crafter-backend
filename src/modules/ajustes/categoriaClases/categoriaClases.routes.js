import express from 'express';
import * as categoriaClaseController from './categoriaClases.controllers.js';
import * as categoriaClaseMiddleware from './categoriaClases.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.get('/', categoriaClaseController.findAll);
router.use(authAdminMiddleware.protect);
router.post('/', categoriaClaseController.create);

router
  .use('/:id', categoriaClaseMiddleware.validExistCategoriaClase)
  .route('/:id')
  .patch(categoriaClaseController.update)
  .delete(categoriaClaseController.deleteItem)
  .get(categoriaClaseController.findOne);

export { router as categoriaClaseRouter };
