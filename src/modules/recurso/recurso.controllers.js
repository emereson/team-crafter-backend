import { Recurso } from "./recurso.model.js";
import { catchAsync } from "../../utils/catchAsync.js";

export const findAll = catchAsync(async (req, res, next) => {
  const recursos = await Recurso.findAll({});

  return res.status(200).json({
    status: "Success",
    results: recursos.length,
    recursos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { recurso } = req;

  return res.status(200).json({
    status: "Success",
    recurso,
  });
});

export const createRecurso = catchAsync(async (req, res, next) => {
  const {
    imagen_recurso,
    titulo_recurso,
    descripcion_recurso,
    link_recurso,
    tiempo_caducidad,
    premium_recurso,
  } = req.body;

  const recurso = await Recurso.create({
    imagen_recurso,
    titulo_recurso,
    descripcion_recurso,
    link_recurso,
    tiempo_caducidad,
    premium_recurso,
  });

  res.status(201).json({
    status: "success",
    message: "the recurso has been created successfully!",
    token,
    recurso,
  });
});

export const updateRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;
  const {
    imagen_recurso,
    titulo_recurso,
    descripcion_recurso,
    link_recurso,
    tiempo_caducidad,
    premium_recurso,
  } = req.body;

  await recurso.update({
    imagen_recurso,
    titulo_recurso,
    descripcion_recurso,
    link_recurso,
    tiempo_caducidad,
    premium_recurso,
  });

  return res.status(200).json({
    status: "success",
    message: "recurso information has been updated",
    recurso,
  });
});

export const deleteRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;

  await recurso.destroy();

  return res.status(200).json({
    status: "success",
    message: `The recurso with id: ${recurso.id} has been deleted`,
  });
});
