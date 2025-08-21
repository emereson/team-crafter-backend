import { Descuento } from "./descuento.model.js";
import { catchAsync } from "../../utils/catchAsync.js";

export const findAll = catchAsync(async (req, res, next) => {
  const descuentos = await Descuento.findAll({});

  return res.status(200).json({
    status: "Success",
    results: descuentos.length,
    descuentos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { descuento } = req;

  return res.status(200).json({
    status: "Success",
    descuento,
  });
});

export const createDescuento = catchAsync(async (req, res, next) => {
  const {
    titulo_descuento,
    descripcion_descuento,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
  } = req.body;

  const descuento = await Descuento.create({
    titulo_descuento,
    descripcion_descuento,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
  });

  res.status(201).json({
    status: "success",
    message: "the descuento has been created successfully!",
    descuento,
  });
});

export const updateDescuento = catchAsync(async (req, res) => {
  const { descuento } = req;
  const {
    titulo_descuento,
    descripcion_descuento,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
  } = req.body;

  await descuento.update({
    titulo_descuento,
    descripcion_descuento,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
  });

  return res.status(200).json({
    status: "success",
    message: "descuento information has been updated",
    descuento,
  });
});

export const deleteDescuento = catchAsync(async (req, res) => {
  const { descuento } = req;

  await descuento.destroy();

  return res.status(200).json({
    status: "success",
    message: `The descuento with id: ${descuento.id} has been deleted`,
  });
});
