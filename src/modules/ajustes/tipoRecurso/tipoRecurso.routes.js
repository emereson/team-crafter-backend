import express from 'express';
import * as tipoRecursoController from './tipoRecurso.controllers.js';
import * as tipoRecursoMiddleware from './tipoRecurso.middleware.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

router.get('/', tipoRecursoController.findAll);
router.use(authAdminMiddleware.protect);
router.post('/', tipoRecursoController.create);

router
  .use('/:id', tipoRecursoMiddleware.validExistTipoRecurso)
  .route('/:id')
  .patch(tipoRecursoController.update)
  .delete(tipoRecursoController.deleteItem)
  .get(tipoRecursoController.findOne);

export { router as tipsRecursoRouter };
