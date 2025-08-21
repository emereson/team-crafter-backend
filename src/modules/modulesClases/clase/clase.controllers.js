import { Clase } from "./clase.model.js";
import { catchAsync } from "../../../utils/catchAsync.js";

export const findAll = catchAsync(async (req, res, next) => {
  const clases = await Clase.findAll({});

  return res.status(200).json({
    status: "Success",
    results: clases.length,
    clases,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { clase } = req;

  return res.status(200).json({
    status: "Success",
    clase,
  });
});

export const createClase = catchAsync(async (req, res, next) => {
  const {
    imagen_clase,
    titulo_clase,
    tiempo_duracion_video,
    nro_reproducciones,
  } = req.body;

  const clase = await Clase.create({
    imagen_clase,
    titulo_clase,
    descripcion_clase,
    tiempo_duracion_video,
    nro_reproducciones,
    nro_likes,
  });

  res.status(201).json({
    status: "success",
    message: "the clase has been created successfully!",
    token,
    clase,
  });
});

export const updateClase = catchAsync(async (req, res) => {
  const { clase } = req;
  const {
    imagen_clase,
    titulo_clase,
    descripcion_clase,
    tiempo_duracion_video,
    nro_reproducciones,
    nro_likes,
  } = req.body;

  await clase.update({
    imagen_clase,
    titulo_clase,
    descripcion_clase,
    tiempo_duracion_video,
    nro_reproducciones,
    nro_likes,
  });

  return res.status(200).json({
    status: "success",
    message: "clase information has been updated",
    clase,
  });
});

export const deleteClase = catchAsync(async (req, res) => {
  const { clase } = req;

  await clase.destroy();

  return res.status(200).json({
    status: "success",
    message: `The clase with id: ${clase.id} has been deleted`,
  });
});
