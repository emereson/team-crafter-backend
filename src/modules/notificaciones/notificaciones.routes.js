import express from 'express';
import * as notificacionesController from './notificaciones.controllers.js';
import * as notificacionesMiddleware from './notificaciones.middleware.js';
import * as adminAuthMiddleware from '../admins/adminAuth.middleware.js';
import * as authMiddleware from '../usuario/user/auth.middleware.js';

const router = express.Router();

router.get(
  '/usuario',
  authMiddleware.protect,
  notificacionesController.findAllUsuarios
);

router.use(adminAuthMiddleware.protect);

router.get('/', notificacionesController.findAll);
router.post('/', notificacionesController.create);

router
  .use('/:id', notificacionesMiddleware.validExistNotificaciones)
  .route('/:id')
  .patch(notificacionesController.update)
  .delete(notificacionesController.deleteNotificacion)
  .get(notificacionesController.findOne);

export { router as notificacionesRouter };
