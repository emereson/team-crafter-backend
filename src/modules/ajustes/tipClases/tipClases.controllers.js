import { TipClase } from './tipClases.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';

export const findAll = catchAsync(async (req, res, next) => {
  const tips = await TipClase.findAll();

  return res.status(200).json({
    status: 'Success',
    results: tips.length,
    tips,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { tip } = req;

  return res.status(200).json({
    status: 'Success',
    tip,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombre_es, nombre_en } = req.body;

  const tip = await TipClase.create({
    nombre_es,
    nombre_en,
  });

  res.status(201).json({
    status: 'success',
    message: 'the tip has been created successfully!',
    tip,
  });
});

export const update = catchAsync(async (req, res, next) => {
  const { tip } = req;
  const { nombre_es, nombre_en } = req.body;

  await tip.update({ nombre_es, nombre_en });

  return res.status(200).json({
    status: 'success',
    message: 'tip information has been updated successfully',
    tip,
  });
});

export const deleteItem = catchAsync(async (req, res) => {
  const { tip } = req;

  await tip.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The tip with id: ${tip.id} has been deleted`,
  });
});
