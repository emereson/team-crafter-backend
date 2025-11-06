import { catchAsync } from '../../utils/catchAsync.js';
import { Notificaciones } from './notificaciones.model.js';

export const findAllUsuarios = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const notificacionesUser = await Notificaciones.findAll({
    where: { usuario_id: sessionUser.id },
  });

  const notificacionesGlobal = await Notificaciones.findAll();

  const notificaciones = [...notificacionesUser, ...notificacionesGlobal].sort(
    (a, b) => b.id - a.id
  );

  return res.status(200).json({
    status: 'Success',
    notificaciones,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const notificaciones = await Notificaciones.findAll({
    where: { notificacion_global: true },
  });

  return res.status(200).json({
    status: 'Success',
    results: notificaciones.length,
    notificaciones,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { notificacion } = req;

  return res.status(200).json({
    status: 'Success',
    notificacion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { tipo_notificacion, titulo, contenido, url_notificacion } = req.body;

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion,
    titulo,
    contenido,
    url_notificacion,
  });

  res.status(201).json({
    status: 'success',
    message: 'the plan has been created successfully!',
  });
});

export const update = catchAsync(async (req, res) => {
  const { notificacion } = req;
  const { tipo_notificacion, titulo, contenido, url_notificacion } = req.body;

  await notificacion.update({
    tipo_notificacion,
    titulo,
    contenido,
    url_notificacion,
  });
  return res.status(200).json({
    status: 'success',
    message: 'notificacion information has been updated',
    notificacion,
  });
});

export const deleteNotificacion = catchAsync(async (req, res) => {
  const { notificacion } = req;

  await notificacion.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The notificacion with id: ${notificacion.id} has been deleted`,
  });
});
