import express from 'express';
import * as categoriaRecursoController from './categoriaRecurso.controllers.js';
import * as categoriaRecursoMiddleware from './categoriaRecurso.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.get('/', categoriaRecursoController.findAll);
router.use(authAdminMiddleware.protect);
router.post('/', categoriaRecursoController.create);

router
  .use('/:id', categoriaRecursoMiddleware.validExistCategoriaRecurso)
  .route('/:id')
  .patch(categoriaRecursoController.update)
  .delete(categoriaRecursoController.deleteItem)
  .get(categoriaRecursoController.findOne);

export { router as categoriaRecursoRouter };
