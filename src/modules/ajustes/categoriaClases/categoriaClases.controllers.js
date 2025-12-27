import { CategoriaClase } from './categoriaClases.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';

export const findAll = catchAsync(async (req, res, next) => {
  const categorias = await CategoriaClase.findAll();

  return res.status(200).json({
    status: 'Success',
    results: categorias.length,
    categorias,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { categoria } = req;

  return res.status(200).json({
    status: 'Success',
    categoria,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombre_es, nombre_en } = req.body;

  const categoria = await CategoriaClase.create({
    nombre_es,
    nombre_en,
  });

  res.status(201).json({
    status: 'success',
    message: 'the categoria has been created successfully!',
    categoria,
  });
});

export const update = catchAsync(async (req, res, next) => {
  const { categoria } = req;
  const { nombre_es, nombre_en } = req.body;

  await categoria.update({ nombre_es, nombre_en });

  return res.status(200).json({
    status: 'success',
    message: 'categoria information has been updated successfully',
    categoria,
  });
});

export const deleteItem = catchAsync(async (req, res) => {
  const { categoria } = req;

  await categoria.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The categoria with id: ${categoria.id} has been deleted`,
  });
});
