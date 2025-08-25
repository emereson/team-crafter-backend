import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ComentarioClase } from './comentarioClase.model.js';

export const validExistComentarioClase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comentarioClase = await ComentarioClase.findOne({
    where: {
      id,
    },
  });

  if (!comentarioClase) {
    return next(new AppError(`comentarioClase with id: ${id} not found `, 404));
  }

  req.comentarioClase = comentarioClase;
  next();
});
