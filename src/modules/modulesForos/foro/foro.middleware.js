import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Foro } from './foro.model.js';

export const validExistForo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const foro = await Foro.findOne({
    where: {
      id,
    },
  });

  if (!foro) {
    return next(new AppError(`foro with id: ${id} not found `, 404));
  }

  req.foro = foro;
  next();
});
