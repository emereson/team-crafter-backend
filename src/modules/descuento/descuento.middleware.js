import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { Descuento } from "./descuento.model.js";

export const validExistDescuento = catchAsync(async (req, res, next) => {
  const { descuentoId } = req.params;

  const descuento = await Descuento.findOne({
    where: {
      id: descuentoId,
    },
  });

  if (!descuento) {
    return next(new AppError(`descuento with id: ${descuentoId} not found `, 404));
  }

  req.descuento = descuento;
  next();
});