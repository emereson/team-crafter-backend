import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { TipoRecurso } from './tipoRecurso.model.js';

export const validExistTipoRecurso = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const tipo = await TipoRecurso.findOne({
    where: {
      id,
    },
  });

  if (!tipo) {
    return next(new AppError(`tipo with id: ${id} not found `, 404));
  }

  req.tipo = tipo;
  next();
});
