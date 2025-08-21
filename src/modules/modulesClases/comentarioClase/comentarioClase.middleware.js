import { AppError } from "../../../utils/AppError.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { ComentarioClase } from "./comentarioClase.model.js";

export const validExistComentarioClase = catchAsync(async (req, res, next) => {
  const { claseId } = req.params;

  const comentarioClase = await ComentarioClase.findOne({
    where: {
      claseId,
    },
  });

  if (!comentarioClase) {
    return next(new AppError(`clase with id: ${claseId} not found `, 404));
  }

  req.comentarioClase = comentarioClase;
  next();
});
