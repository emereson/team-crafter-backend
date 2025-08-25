import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { RespuestaComentarioClase } from './respuestaComentarioClase.model.js';

export const validExistRespuestaComentarioClase = catchAsync(
  async (req, res, next) => {
    const { claseId } = req.params;

    const respuestaComentarioClase = await RespuestaComentarioClase.findOne({
      where: {
        claseId,
      },
    });

    if (!respuestaComentarioClase) {
      return next(new AppError(`clase with id: ${claseId} not found `, 404));
    }

    req.respuestaComentarioClase = respuestaComentarioClase;
    next();
  }
);
