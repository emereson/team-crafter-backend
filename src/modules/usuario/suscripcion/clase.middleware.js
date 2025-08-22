import { AppError } from "../../../utils/AppError.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { Clase } from "./clase.model.js";

export const validExistClase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const clase = await Clase.findOne({
    where: {
      id,
    },
  });

  if (!clase) {
    return next(new AppError(`clase with id: ${id} not found `, 404));
  }

  req.clase = clase;
  next();
});
