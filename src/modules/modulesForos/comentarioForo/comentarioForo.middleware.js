import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ComentarioForo } from './comentarioForo.model.js';

export const validExistComentarioForo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comentarioForo = await ComentarioForo.findOne({
    where: {
      id,
    },
  });

  if (!comentarioForo) {
    return next(new AppError(`comentarioForo with id: ${id} not found `, 404));
  }

  req.comentarioForo = comentarioForo;
  next();
});
