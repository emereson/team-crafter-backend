import { Clase } from './clase.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Recurso } from '../../recurso/recurso.model.js';
import { FRONTEND_URL } from '../../../../config.js';
import { Notificaciones } from '../../notificaciones/notificaciones.model.js';
import { Op } from 'sequelize';
import { CategoriaClase } from '../../ajustes/categoriaClases/categoriaClases.model.js';
import { TipClase } from '../../ajustes/tipClases/tipClases.model.js';
import { CategoriaClasesId } from './categoriaClasesId.model.js';
import { TipClasesId } from './tipClasesId.model.js';
import { Favorito } from '../../usuario/favoritos/favorito.model.js';

export const buscador = catchAsync(async (req, res, next) => {
  const { buscador } = req.query;

  if (!buscador || buscador.length === 0) {
    return res.status(200).json({ status: 'success', clases: [] });
  }

  const clases = await Clase.findAll({
    where: {
      [Op.or]: [
        { titulo_clase: { [Op.like]: `%${buscador}%` } },
        { titulo_clase_en: { [Op.like]: `%${buscador}%` } },
        { descripcion_clase: { [Op.like]: `%${buscador}%` } },
        { descripcion_clase_en: { [Op.like]: `%${buscador}%` } },
        { '$recurso.nombre_recurso$': { [Op.like]: `%${buscador}%` } }, // Buscar en Recursos
      ],
    },
    include: [
      {
        model: Recurso,
        as: 'recurso',
        required: false, // Siempre incluir los recursos
      },
      // { model: CategoriaClase, as: 'categoria_clase' },
      // { model: TipClase, as: 'tip_clase' },
    ],
  });

  return res.status(200).json({
    status: 'success',
    clases,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const { categoria_clase, tutoriales_tips, cuatro_ultimos, order } = req.query;

  let whereCategoria = {};
  let whereTip = {};

  // Corrected Categoría Logic
  if (categoria_clase) {
    const categoriasArray = categoria_clase
      .split(',')
      .map((cat) => cat.trim()) // Trim first while it's a string
      .filter((cat) => cat !== '' && cat !== 'Todos') // Filter out "Todos" and empties
      .map(Number) // Convert to Number
      .filter((num) => !isNaN(num)); // Ensure they are valid numbers

    if (categoriasArray.length > 0) {
      whereCategoria.categoria_clase_id = {
        [Op.in]: categoriasArray,
      };
    }
  }

  // Corrected Tutoriales Logic
  if (tutoriales_tips) {
    const tutorialesArray = tutoriales_tips
      .split(',')
      .map((tut) => tut.trim())
      .filter((tut) => tut !== '' && tut !== 'Todos')
      .map(Number)
      .filter((num) => !isNaN(num));

    if (tutorialesArray.length > 0) {
      whereTip.tip_clase_id = {
        [Op.in]: tutorialesArray,
      };
    }
  }

  try {
    const clases = await Clase.findAll({
      // IMPORTANT: If you want to FILTER the 'Clase' based on these IDs,
      // you usually need 'required: true' in the include.
      include: [
        { model: Recurso, as: 'recurso' },
        {
          model: CategoriaClasesId,
          as: 'categorias_id',
          required: Object.keys(whereCategoria).length > 0, // Filter Clase if category is provided
          where: whereCategoria,
          include: [{ model: CategoriaClase, as: 'categoria_clase' }],
        },
        {
          model: TipClasesId,
          as: 'tips_id',
          required: Object.keys(whereTip).length > 0, // Filter Clase if tip is provided
          where: whereTip,
          include: [{ model: TipClase, as: 'tip_clase' }],
        },
      ],
      order: [['createdAt', order === 'asc' ? 'ASC' : 'DESC']],
      limit: cuatro_ultimos === 'true' ? 4 : undefined, // Assuming "cuatro_ultimos" means 4
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
    titulo_clase_en,
    descripcion_clase,
    descripcion_clase_en,
    categoria_clase_id,
    tutoriales_tips_id,
  } = req.body;

  const categoriasArray = categoria_clase_id
    ? String(categoria_clase_id).split(',').map(Number).filter(Boolean)
    : [];

  const tipsArray = tutoriales_tips_id
    ? String(tutoriales_tips_id).split(',').map(Number).filter(Boolean)
    : [];

  const clase = await Clase.create({
    video_clase,
    poster_url,
    duracion_video,
    titulo_clase,
    titulo_clase_en,
    descripcion_clase,
    descripcion_clase_en,
  });

  await Promise.all(
    categoriasArray.map((categoriaId) =>
      CategoriaClasesId.create({
        clase_id: clase.id,
        categoria_clase_id: categoriaId,
      }),
    ),
  );

  await Promise.all(
    tipsArray.map((tipId) =>
      TipClasesId.create({
        clase_id: clase.id,
        tip_clase_id: tipId,
      }),
    ),
  );

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion: 'noticias',
    titulo: 'Nueva clase disponible',
    contenido: `${titulo_clase}, ver ahora`,
    url_notificacion: `${FRONTEND_URL}/dashboard/clases/${clase.id}`,
  });

  res.status(201).json({
    status: 'success',
    message: 'The clase has been created successfully!',
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
    titulo_clase_en,
    descripcion_clase,
    descripcion_clase_en,
    categoria_clase_id,
    tutoriales_tips_id,
  } = req.body;

  const categoriasArray = categoria_clase_id
    ? String(categoria_clase_id).split(',').map(Number).filter(Boolean)
    : [];

  const tipsArray = tutoriales_tips_id
    ? String(tutoriales_tips_id).split(',').map(Number).filter(Boolean)
    : [];

  await TipClasesId.destroy({ where: { clase_id: clase.id } });
  await CategoriaClasesId.destroy({ where: { clase_id: clase.id } });

  const updateData = {
    video_clase,
    poster_url,
    duracion_video,
    titulo_clase,
    titulo_clase_en,
    descripcion_clase,
    descripcion_clase_en,
  };

  await clase.update(updateData);

  await Promise.all(
    categoriasArray.map((categoriaId) =>
      CategoriaClasesId.create({
        clase_id: clase.id,
        categoria_clase_id: categoriaId,
      }),
    ),
  );

  await Promise.all(
    tipsArray.map((tipId) =>
      TipClasesId.create({
        clase_id: clase.id,
        tip_clase_id: tipId,
      }),
    ),
  );

  return res.status(200).json({
    status: 'success',
    message: 'Clase information has been updated successfully',
    clase,
  });
});

export const deleteClase = catchAsync(async (req, res) => {
  const { clase } = req;

  await TipClasesId.destroy({ where: { clase_id: clase.id } });
  await CategoriaClasesId.destroy({ where: { clase_id: clase.id } });
  await Favorito.destroy({ where: { clase_id: clase.id } });

  await clase.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The clase with id: ${clase.id} has been deleted`,
  });
});
