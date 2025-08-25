import express from 'express';
import * as lickeClaseMiddleware from './likeClase.middleware.js';
import * as likeClaseController from './likeClase.controllers.js';
import * as claseMiddleware from '../../modulesClases/clase/clase.middleware.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', likeClaseController.findAll);
router.post(
  '/:id',
  claseMiddleware.validExistClase,
  likeClaseController.create
);

router
  .use('/:id', claseMiddleware.validExistClase)
  .route('/:id')
  .patch(likeClaseController.update)
  .delete(likeClaseController.deleteLikeClase)
  .get(likeClaseController.findOne);

const likeClaseRouter = router;

export { likeClaseRouter };
