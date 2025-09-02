import express from 'express';
import * as planMiddleware from './plan.middleware.js';
import * as planController from './plan.controllers.js';

const router = express.Router();

router.get('/', planController.findAll);
router.post('/', planController.create);

router
  .use('/:id', planMiddleware.validExistPlan)
  .route('/:id')
  .patch(planController.update)
  // .delete(planController.deleteUser)
  .get(planController.findOne);

export { router as planRouter };
