import express from 'express';
import * as claseMiddleware from './clase.middleware.js';
import * as claseController from './clase.controllers.js';
import { uploadImage } from '../../../utils/multer.js';

const router = express.Router();

router.get('/', claseController.findAll);
router.post('/', claseController.createClase);
router.get(
  '/view/:id',
  claseMiddleware.validExistClase,
  claseController.findViewClase
);

router
  .use('/:id', claseMiddleware.validExistClase)
  .route('/:id')
  .patch(claseController.updateClase)
  .delete(claseController.deleteClase)
  .get(claseController.findOne);

const claseRouter = router;

export { claseRouter };
