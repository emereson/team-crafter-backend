import { AppError } from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { Admin } from './admin.model.js';

export const validExistAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const admin = await Admin.findOne({
    where: {
      id,
    },
  });

  if (!admin) {
    return next(new AppError(`admin with id: ${id} not found `, 404));
  }

  req.admin = admin;
  next();
});
