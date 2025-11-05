import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Suscripcion } from './suscripcion.model.js';

export const validExistSuscripcion = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const suscripcion = await Suscripcion.findOne({
    where: {
      id,
    },
  });

  if (!suscripcion) {
    return next(new AppError(`suscripcion with id: ${id} not found `, 404));
  }

  req.suscripcion = suscripcion;
  next();
});
