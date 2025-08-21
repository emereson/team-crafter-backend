import { Favorito } from "./favorito.model.js";
import { catchAsync } from "../../utils/catchAsync.js";

export const findAll = catchAsync(async (req, res, next) => {
  const favoritos = await Favorito.findAll({});

  return res.status(200).json({
    status: "Success",
    results: favoritos.length,
    favoritos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { favorito } = req;

  return res.status(200).json({
    status: "Success",
    favorito,
  });
});

export const createFavorito = catchAsync(async (req, res, next) => {
  const {
    usuario_id,
    clase_id,
    titulo_favorito,
    status
  } = req.body;

  const favorito = await Favorito.create({
    usuario_id,
    clase_id,
    titulo_favorito,
    status
  });

  res.status(201).json({
    status: "success",
    message: "the favorito has been created successfully!",
    favorito,
  });
});

export const updateFavorito = catchAsync(async (req, res) => {
  const { favorito } = req;
  const {
    usuario_id,
    clase_id,
    titulo_favorito,
    status
  } = req.body;

  await favorito.update({
    usuario_id,
    clase_id,
    titulo_favorito,
    status
  });

  return res.status(200).json({
    status: "success",
    message: "descuento information has been updated",
    descuento,
  });
});

export const deleteFavorito = catchAsync(async (req, res) => {
  const { favorito } = req;

  await favorito.destroy();

  return res.status(200).json({
    status: "success",
    message: `The favorito with id: ${favorito.id} has been deleted`,
  });
});
