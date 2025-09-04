import express from 'express';
import * as userMiddleware from './user.middleware.js';
import * as authMiddleware from './auth.middleware.js';
import * as userController from './user.controllers.js';
import { uploadImage } from '../../../utils/multer.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/verificar-correo/:token', userController.verificarCorreo);
router.post('/correo-password', userController.correoRecuperarPassword);
router.post('/nuevo-password/:token', userController.nuevoPassword);
router.post(
  '/resultado-registro-tarjeta',
  userController.resultadoRegistrarTarjeta
);

router.use(authMiddleware.protect);
router.get('/', userController.findAll);
router.get('/perfil', userController.findPerfil);
router.get('/suscripciones', userController.findPerfilSuscripciones);

router.get('/registrar-tarjeta', userController.finRegistrarTarjeta);

router
  .use('/:id', userMiddleware.validExistUser)
  .route('/:id')
  .patch(uploadImage.single('img'), userController.update)
  .delete(userController.deleteUser)
  .get(userController.findOne);

const usersRouter = router;

export { usersRouter };
