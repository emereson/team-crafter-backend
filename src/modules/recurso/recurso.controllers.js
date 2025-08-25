import { Recurso } from './recurso.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { deleteDocument, deleteImage } from '../../utils/deleteUploads.js';

export const findAll = catchAsync(async (req, res, next) => {
  const recursos = await Recurso.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: recursos.length,
    recursos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { recurso } = req;

  return res.status(200).json({
    status: 'Success',
    recurso,
  });
});

export const createRecurso = catchAsync(async (req, res, next) => {
  const { clase } = req;
  const {
    nombre_recurso,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  } = req.body;

  const doc = req.file ? req.file.filename : null;

  const recurso = await Recurso.create({
    clase_id: clase.id,
    nombre_recurso,
    descripcion_recurso,
    link_recurso: doc,
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  });

  res.status(201).json({
    status: 'success',
    message: 'the recurso has been created successfully!',
    recurso,
  });
});

export const updateRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;
  const { nombre_recurso, descripcion_recurso, fecha_caducidad, tipo_recurso } =
    req.body;

  const updateData = {
    nombre_recurso,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso,
  };

  if (req.file) {
    if (clase.link_recurso) {
      await deleteDocument(clase.link_recurso);
    }

    updateData.link_recurso = req.file.filename;
  }

  await recurso.update(updateData);

  const updatedRecurso = await recurso.reload();

  return res.status(200).json({
    status: 'success',
    message: 'recurso information has been updated',
    updatedRecurso,
  });
});

export const deleteRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;

  if (recurso.link_recurso) {
    await deleteDocument(recurso.link_recurso);
  }

  await recurso.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The recurso with id: ${recurso.id} has been deleted`,
  });
});
