import express from 'express';
import { uploadDoc } from '../../utils/multer.js';

import * as recursoMiddleware from './recurso.middleware.js';
import * as recursoController from './recurso.controllers.js';
import * as claseMiddleware from '../modulesClases/clase/clase.middleware.js';
import * as authAdminMiddleware from '../admins/adminAuth.middleware.js';

const router = express.Router();

// ✅ Solo el POST requiere auth
router.post(
  '/clase/:id',
  // authAdminMiddleware.protect,
  claseMiddleware.validExistClase,
  uploadDoc.fields([
    { name: 'img', maxCount: 1 },
    { name: 'doc', maxCount: 1 },
  ]),
  recursoController.createRecurso
);

// ✅ GET general sin auth
router.get('/', recursoController.findAll);

// ✅ Rutas para un recurso específico
router
  .use('/:id', recursoMiddleware.validExistRecurso) // middleware que solo valida existencia
  .route('/:id')
  .get(recursoController.findOne) // libre
  .patch(recursoController.updateRecurso) // libre (si quieres aquí también auth, lo pones)
  .delete(recursoController.deleteRecurso); // libre (igual, puedes poner auth si quieres)

export { router as recursoRouter };
