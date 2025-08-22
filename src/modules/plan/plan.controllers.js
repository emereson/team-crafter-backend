import { Plan } from './plan.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';

export const findAll = catchAsync(async (req, res, next) => {
  const planes = await Plan.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: planes.length,
    planes,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { plan } = req;

  return res.status(200).json({
    status: 'Success',
    plan,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombre, costo } = req.body;

  const plan = await Plan.create({
    nombre,
    costo,
  });

  res.status(201).json({
    status: 'success',
    message: 'the plan has been created successfully!',
    token,
    plan,
  });
});

export const update = catchAsync(async (req, res) => {
  const { plan } = req;
  const { nombre, costo } = req.body;

  await plan.update({
    nombre,
    costo,
  });
  return res.status(200).json({
    status: 'success',
    message: 'plan information has been updated',
    plan,
  });
});

export const deletePlan = catchAsync(async (req, res) => {
  const { plan } = req;

  await plan.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The plan with id: ${plan.id} has been deleted`,
  });
});
