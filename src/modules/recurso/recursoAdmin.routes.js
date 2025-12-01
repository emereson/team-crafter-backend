import express from 'express';
import { upload } from '../../utils/multer.js';

import * as recursoMiddleware from './recurso.middleware.js';
import * as recursoController from './recurso.controllers.js';
import * as claseMiddleware from '../modulesClases/clase/clase.middleware.js';
import * as authAdminMiddleware from '../admins/adminAuth.middleware.js';

const router = express.Router();
router.use(authAdminMiddleware.protect);

router.get('/', recursoController.findAll);

// Rutas para un recurso específico

router.post(
  '/clase/:id',
  claseMiddleware.validExistClase,
  upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'doc', maxCount: 1 },
  ]),
  recursoController.createRecurso
);

router.post(
  '/',
  upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'doc', maxCount: 1 },
  ]),
  recursoController.create
);

router
  .use('/:id', recursoMiddleware.validExistRecurso)
  .route('/:id')
  .get(recursoController.findOne)
  .patch(
    upload.fields([
      { name: 'img', maxCount: 1 },
      { name: 'doc', maxCount: 1 },
    ]),
    recursoController.updateRecurso
  )
  .delete(recursoController.deleteRecurso);

export { router as recursoAdminRouter };
