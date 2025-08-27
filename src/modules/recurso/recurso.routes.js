import express from 'express';
import { uploadDoc } from '../../utils/multer.js';

import * as recursoMiddleware from './recurso.middleware.js';
import * as recursoController from './recurso.controllers.js';
import * as claseMiddleware from '../modulesClases/clase/clase.middleware.js';
import * as authMiddleware from '../usuario/user/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', recursoController.findAll);

router.post(
  '/clase/:id',
  claseMiddleware.validExistClase,
  uploadDoc.single('doc'),
  recursoController.createRecurso
);

// Rutas para un recurso específico
router
  .use('/:id', recursoMiddleware.validExistRecurso)
  .route('/:id')
  .get(recursoController.findOne)
  .patch(recursoController.updateRecurso)
  .delete(recursoController.deleteRecurso);

const recursoRouter = router;

export { recursoRouter };
