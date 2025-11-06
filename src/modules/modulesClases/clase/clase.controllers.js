import { Clase } from './clase.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Recurso } from '../../recurso/recurso.model.js';
import { FRONTEND_URL } from '../../../../config.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';
import { Op } from 'sequelize';

export const buscador = catchAsync(async (req, res, next) => {
  const { buscador } = req.query;

  if (!buscador || buscador.length === 0) {
    return res.status(200).json({ status: 'success', clases: [] });
  }

  const clases = await Clase.findAll({
    where: {
      [Op.or]: [
        { titulo_clase: { [Op.like]: `%${buscador}%` } },
        { descripcion_clase: { [Op.like]: `%${buscador}%` } },
        { '$recurso.nombre_recurso$': { [Op.like]: `%${buscador}%` } }, // Buscar en Recursos
      ],
    },
    include: [
      {
        model: Recurso,
        as: 'recurso',
        required: false, // Siempre incluir los recursos
      },
    ],
  });

  return res.status(200).json({
    status: 'success',
    clases,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const { categoria_clase, tutoriales_tips, cuatro_ultimos, order } = req.query;

  let whereConditions = {};

  // Manejar filtros múltiples para categorías
  if (categoria_clase && categoria_clase.length > 0) {
    const categoriasArray = categoria_clase.split(',').map((cat) => cat.trim());
    if (categoriasArray.length > 0 && !categoriasArray.includes('Todos')) {
      whereConditions.categoria_clase = {
        [Op.in]: categoriasArray,
      };
    }
  }

  // Manejar filtros múltiples para tutoriales
  if (tutoriales_tips && tutoriales_tips.length > 0) {
    const tutorialesArray = tutoriales_tips.split(',').map((tut) => tut.trim());
    if (tutorialesArray.length > 0 && !tutorialesArray.includes('Todos')) {
      whereConditions.tutoriales_tips = {
        [Op.in]: tutorialesArray,
      };
    }
  }

  try {
    const clases = await Clase.findAll({
      where: whereConditions,
      include: [{ model: Recurso, as: 'recurso' }],
      order: [['createdAt', order || 'desc']],
      limit: cuatro_ultimos === 'true' ? 2 : undefined,
    });

    return res.status(200).json({
      status: 'Success',
      results: clases.length,
      clases,
    });
  } catch (error) {
    return next(error);
  }
});

export const findOne = catchAsync(async (req, res, next) => {
  const { clase } = req;

  return res.status(200).json({
    status: 'Success',
    clase,
  });
});

export const findViewClase = catchAsync(async (req, res, next) => {
  const { clase } = req;
  await clase.update({ nro_reproducciones: clase.nro_reproducciones + 1 });

  return res.status(200).json({
    status: 'Success',
    clase,
  });
});

export const createClase = catchAsync(async (req, res, next) => {
  const {
    video_clase,
    poster_url,
    duracion_video,
    titulo_clase,
    descripcion_clase,
    categoria_clase,
    tutoriales_tips,
  } = req.body;

  const clase = await Clase.create({
    video_clase,
    poster_url,
    duracion_video,
    titulo_clase,
    descripcion_clase,
    categoria_clase,
    tutoriales_tips,
  });

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion: 'noticias',
    titulo: 'Nueva clase disponible',
    contenido: `${titulo_clase}, ver ahora`,
    url_notificacion: `${FRONTEND_URL}/dashboard/clases/${clase.id}`,
  });

  res.status(201).json({
    status: 'success',
    message: 'the clase has been created successfully!',
    clase,
  });
});

export const updateClase = catchAsync(async (req, res, next) => {
  const { clase } = req;
  const {
    video_clase,
    poster_url,
    duracion_video,
    titulo_clase,
    descripcion_clase,
    categoria_clase,
    tutoriales_tips,
  } = req.body;

  const updateData = {
    video_clase,
    poster_url,
    duracion_video,
    titulo_clase,
    descripcion_clase,
    categoria_clase,
    tutoriales_tips,
  };

  await clase.update(updateData);

  const updatedClase = await clase.reload();

  return res.status(200).json({
    status: 'success',
    message: 'Clase information has been updated successfully',
    clase: updatedClase,
  });
});

export const deleteClase = catchAsync(async (req, res) => {
  const { clase } = req;

  await clase.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The clase with id: ${clase.id} has been deleted`,
  });
});
