import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { LikeClase } from './likeClase.model.js';

export const validExistLikeClase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const likeClase = await LikeClase.findOne({
    where: {
      id: id,
    },
  });

  if (!likeClase) {
    return next(
      new AppError(`likeClase with id: ${likeClase} not found `, 404)
    );
  }

  req.likeClase = likeClase;
  next();
});
