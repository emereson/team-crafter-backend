import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { Favorito } from "./favorito.model.js";

export const validExistFavorito = catchAsync(async (req, res, next) => {
  const { favoritoId } = req.params;

  const favorito = await Favorito.findOne({
    where: {
      id: favoritoId,
    },
  });

  if (!favorito) {
    return next(new AppError(`favorito with id: ${favoritoId} not found `, 404));
  }

  req.favorito = favorito;
  next();
});