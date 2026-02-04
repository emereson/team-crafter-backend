import express from 'express';
import * as suscripcionController from './suscripcion.controllers.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();
router.use(authAdminMiddleware.protect);

router.get('/analytics', suscripcionController.findAnalytics);
router.get('/analytics-planes', suscripcionController.findPlanAllAnalytics);
router.get('/stats', suscripcionController.getDashboardStats);

// router
//   .use('/:id', recursoMiddleware.validExistRecurso)
//   .route('/:id')
//   .get(recursoController.findOne)
//   .patch(
//     upload.fields([
//       { name: 'img', maxCount: 1 },
//       { name: 'doc', maxCount: 1 },
//     ]),
//     recursoController.updateRecurso,
//   )
//   .delete(recursoController.deleteRecurso);

export { router as suscripcionAdminRouter };
