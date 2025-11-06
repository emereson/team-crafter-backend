import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { LikeForo } from './descargas.model.js';

export const validExistLikeForo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const likeForo = await LikeForo.findOne({
    where: {
      id: id,
    },
  });

  if (!likeForo) {
    return next(new AppError(`likeForo with id: ${likeForo} not found `, 404));
  }

  req.likeForo = likeForo;
  next();
});
