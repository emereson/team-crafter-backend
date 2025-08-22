import { AppError } from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { Plan } from './plan.model.js';

export const validExistPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const plan = await Plan.findOne({
    where: {
      id,
    },
  });

  if (!plan) {
    return next(new AppError(`plan with id: ${id} not found `, 404));
  }

  req.plan = plan;
  next();
});
