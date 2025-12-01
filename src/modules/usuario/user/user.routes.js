import express from 'express';
import * as userMiddleware from './user.middleware.js';
import * as authMiddleware from './auth.middleware.js';
import * as userController from './user.controllers.js';
import passport from '../../../config/passport.js';
import { upload } from '../../../utils/multer.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  (req, res) => {
    const { user, token } = req.user;
    res.redirect(
      `https://app.team-crafter.com/google-success?token=${token}&email=${user.correo}`
    );
  }
);

router.get('/verificar-correo/:token', userController.verificarCorreo);
router.post('/correo-password', userController.correoRecuperarPassword);
router.post('/nuevo-password/:token', userController.nuevoPassword);
router.post(
  '/resultado-registro-tarjeta',
  userController.resultadoRegistrarTarjeta
);

router.get('/resultado-paypal', userController.resultadoPaypal);
router.get('/migracion-paypal', userController.migrarPaypal);

router.post('/datos-cliente-flow/:id', userController.datosClienteFlow);

router.use(authMiddleware.protect);
router.get('/', userController.findAll);
router.get('/perfil', userController.findPerfil);
router.get('/suscripciones', userController.findPerfilSuscripciones);

router.get('/registrar-tarjeta', userController.finRegistrarTarjeta);

router
  .use('/:id', userMiddleware.validExistUser)
  .route('/:id')
  .patch(upload.single('img'), userController.update)
  .delete(userController.deleteUser)
  .get(userController.findOne);

const usersRouter = router;

export { usersRouter };
