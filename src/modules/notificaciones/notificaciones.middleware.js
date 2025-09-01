import { AppError } from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { Notificaciones } from './notificaciones.model.js';

export const validExistNotificaciones = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notificacion = await Notificaciones.findOne({
    where: {
      id,
    },
  });

  if (!notificacion) {
    return next(new AppError(`notificacion with id: ${id} not found `, 404));
  }

  req.notificacion = notificacion;
  next();
});
