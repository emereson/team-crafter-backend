import { Recurso } from './recurso.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { deleteImage, uploadImage } from '../../utils/serverImage.js';
import { Clase } from '../modulesClases/clase/clase.model.js';
import { sendRecursoCaducado } from '../../utils/nodemailer.js';
import { Notificaciones } from '../notificaciones/notificaciones.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { categoria_recurso, tipo_recurso, cuatro_ultimos, order } = req.query;

  let whereCategoria = {};

  if (
    categoria_recurso &&
    categoria_recurso.length > 3 &&
    categoria_recurso !== 'Todos'
  ) {
    whereCategoria.categoria_recurso = categoria_recurso;
  }

  if (tipo_recurso && tipo_recurso.length > 3 && tipo_recurso !== 'Todos') {
    whereCategoria.tipo_recurso = tipo_recurso;
  }

  const recursos = await Recurso.findAll({
    where: whereCategoria,

    include: [{ model: Clase, as: 'clase' }],
    order: [['createdAt', order ? order : 'desc']],
    limit: cuatro_ultimos === 'true' ? 3 : undefined, // solo si cuatro_ultimos es true
  });

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
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  } = req.body;

  const imagen = req.files?.img ? req.files.img[0] : null;
  const documento = req.files?.doc ? req.files.doc[0] : null;

  const recurso = await Recurso.create({
    clase_id: clase.id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    img_recurso: await uploadImage(imagen),
    link_recurso: await uploadImage(documento),
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  });

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion: 'noticias',
    titulo: 'Nuevo recurso añadido',
    contenido: `Descargar el nuevo ${nombre_recurso}`,
  });

  res.status(201).json({
    status: 'success',
    message: 'the recurso has been created successfully!',
    recurso,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    clase_id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  } = req.body;

  const imagen = req.files?.img ? req.files.img[0] : null;
  const documento = req.files?.doc ? req.files.doc[0] : null;

  const recurso = await Recurso.create({
    clase_id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    img_recurso: await uploadImage(imagen),
    link_recurso: await uploadImage(documento),
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  });

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion: 'noticias',
    titulo: 'Nuevo recurso añadido',
    contenido: `Descargar el nuevo ${nombre_recurso}`,
  });

  res.status(201).json({
    status: 'success',
    message: 'the recurso has been created successfully!',
    recurso,
  });
});

export const updateRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;
  const {
    clase_id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  } = req.body;

  const imagen = req.files?.img ? req.files.img[0] : null;
  const documento = req.files?.doc ? req.files.doc[0] : null;

  const updateData = {
    clase_id: clase_id ? clase_id : null,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso,
    categoria_recurso,
  };

  if (imagen) {
    if (recurso.img_recurso) {
      await deleteImage(recurso.img_recurso);
    }
    updateData.img_recurso = await uploadImage(imagen);
  }

  if (documento) {
    if (recurso.link_recurso) {
      await deleteImage(recurso.link_recurso);
    }
    updateData.link_recurso = await uploadImage(documento);
  }

  await recurso.update(updateData);

  const updatedRecurso = await recurso.reload();

  return res.status(200).json({
    status: 'success',
    message: 'recurso information has been updated',
    updatedRecurso,
  });
});

export const expirado = catchAsync(async (req, res, next) => {
  const { recurso, sessionUser } = req;
  const { mensaje } = req.body;
  await sendRecursoCaducado(
    recurso.nombre_recurso,
    sessionUser.correo,
    mensaje
  );

  return res.status(200).json({
    status: 'Success',
  });
});

export const deleteRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;

  if (recurso.link_recurso) {
    await deleteImage(recurso.link_recurso);
  }

  if (recurso.img_recurso) {
    await deleteImage(recurso.img_recurso);
  }

  await recurso.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The recurso with id: ${recurso.id} has been deleted`,
  });
});
