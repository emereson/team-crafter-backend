import express from 'express';
import * as suscripcionController from './suscripcion.controllers.js';
import * as planMiddleware from '../../plan/plan.middleware.js';
import * as authMiddleware from '../../usuario/user/auth.middleware.js';

const router = express.Router();

router.post('/confirmacion', suscripcionController.confirmarPago);
router.post('/compra-completada', async (req, res) => {
  const { token } = req.body; // Flow envía token

  console.log('Token recibido de Flow:', token);

  res.redirect('https://dashboard.team-crafter.com/compra-completada');
});
router.use(authMiddleware.protect);

router.post(
  '/:id',
  planMiddleware.validExistPlan,
  suscripcionController.crearSuscripcion
);

router.get('/activa', suscripcionController.obtenerContenidoPremium);

// router
//   .use("/:id", claseMiddleware.validExistClase)
//   .route("/:id")
//   .patch(claseController.update)
//   .delete(claseController.deleteUser)
//   .get(claseController.findOne);

const suscripcionRouter = router;

export { suscripcionRouter };
