import express from 'express';
import * as claseMiddleware from './clase.middleware.js';
import * as claseController from './clase.controllers.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', claseController.findAll);
router.get(
  '/view/:id',
  claseMiddleware.validExistClase,
  claseController.findViewClase
);
router.get('/:id', claseMiddleware.validExistClase, claseController.findOne);

// Rutas protegidas (solo admin)
router.use(authAdminMiddleware.protect);

router.post('/', claseController.createClase);
router.patch(
  '/:id',
  claseMiddleware.validExistClase,
  claseController.updateClase
);
router.delete(
  '/:id',
  claseMiddleware.validExistClase,
  claseController.deleteClase
);

export { router as claseRouter };
