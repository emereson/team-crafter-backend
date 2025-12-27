import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { RespuestaComentarioClase } from './respuestaComentarioClase.model.js';

export const validExistRespuestaComentarioClase = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const respuestaComentarioClase = await RespuestaComentarioClase.findOne({
      where: {
        id,
      },
    });

    if (!respuestaComentarioClase) {
      return next(new AppError(`clase with id: ${id} not found `, 404));
    }

    req.respuestaComentarioClase = respuestaComentarioClase;
    next();
  }
);
