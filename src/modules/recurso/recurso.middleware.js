import { AppError } from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { Recurso } from './recurso.model.js';

export const validExistRecurso = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const recurso = await Recurso.findOne({
    where: {
      id,
    },
  });

  if (!recurso) {
    return next(new AppError(`recurso with id: ${id} not found `, 404));
  }

  req.recurso = recurso;
  next();
});
