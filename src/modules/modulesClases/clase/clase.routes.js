import express from 'express';
import * as claseMiddleware from './clase.middleware.js';
import * as claseController from './clase.controllers.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', claseController.findAll);
router.get('/:id', claseMiddleware.validExistClase, claseController.findOne);

router.get(
  '/view/:id',
  claseMiddleware.validExistClase,
  claseController.findViewClase
);

const claseRouter = router;

export { claseRouter };
