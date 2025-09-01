import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { RespuestaComentarioForo } from './respuestaComentarioForo.model.js';

export const validExistRespuestaComentarioForo = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const respuestaComentarioForo = await RespuestaComentarioForo.findOne({
      where: {
        id,
      },
    });

    if (!respuestaComentarioForo) {
      return next(new AppError(`clase with id: ${id} not found `, 404));
    }

    req.respuestaComentarioForo = respuestaComentarioForo;
    next();
  }
);
