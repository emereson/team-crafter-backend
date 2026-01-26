import express from 'express';
import * as userMiddleware from './user.middleware.js';
import * as userController from './user.controllers.js';
import * as authAdminMiddleware from '../../admins/adminAuth.middleware.js';

const router = express.Router();
router.use(authAdminMiddleware.protect);

router.get('/analytics', userController.findAllAnalytics);

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

export { router as usersAdminRouter };
