import express from 'express';
import * as adminMiddleware from './admin.middleware.js';
import * as adminAuthMiddleware from './adminAuth.middleware.js';
import * as adminController from './admin.controllers.js';

const router = express.Router();

router.post('/login', adminController.login);
router.get('/', adminController.findAll);

// router.use(adminAuthMiddleware.protect);
router.post('/signup', adminController.signup);

router
  .use('/:id', adminMiddleware.validExistAdmin)
  .route('/:id')
  .patch(adminController.update)
  .delete(adminController.deleteAdmin)
  .get(adminController.findOne);

const adminRouter = router;

export { adminRouter };
