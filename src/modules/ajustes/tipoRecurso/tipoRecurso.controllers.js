import { catchAsync } from '../../../utils/catchAsync.js';
import { TipoRecurso } from './tipoRecurso.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const tipos = await TipoRecurso.findAll();

  return res.status(200).json({
    status: 'Success',
    results: tipos.length,
    tipos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { tipo } = req;

  return res.status(200).json({
    status: 'Success',
    tipo,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombre_es, nombre_en } = req.body;

  const tipo = await TipoRecurso.create({
    nombre_es,
    nombre_en,
  });

  res.status(201).json({
    status: 'success',
    message: 'the tipo has been created successfully!',
    tipo,
  });
});

export const update = catchAsync(async (req, res, next) => {
  const { tipo } = req;
  const { nombre_es, nombre_en } = req.body;

  await tipo.update({ nombre_es, nombre_en });

  return res.status(200).json({
    status: 'success',
    message: 'tipo information has been updated successfully',
    tipo,
  });
});

export const deleteItem = catchAsync(async (req, res) => {
  const { tipo } = req;

  await tipo.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The tipo with id: ${tipo.id} has been deleted`,
  });
});
