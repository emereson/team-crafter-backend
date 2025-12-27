import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { CategoriaClase } from './categoriaClases.model.js';

export const validExistCategoriaClase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const categoria = await CategoriaClase.findOne({
    where: {
      id,
    },
  });

  if (!categoria) {
    return next(new AppError(`categoria with id: ${id} not found `, 404));
  }

  req.categoria = categoria;
  next();
});
