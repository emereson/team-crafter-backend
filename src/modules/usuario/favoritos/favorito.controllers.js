import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Clase } from '../../modulesClases/clase/clase.model.js';
import { Favorito } from './favorito.model.js';

// GET /like-clase

export const findAllView = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { categoria_clase, tutoriales_tips, cuatro_ultimos, order } = req.query;

  let whereCategoria = {};

  if (
    categoria_clase &&
    categoria_clase.length > 3 &&
    categoria_clase !== 'Todos'
  ) {
    whereCategoria.categoria_clase = categoria_clase;
  }

  if (
    tutoriales_tips &&
    tutoriales_tips.length > 3 &&
    tutoriales_tips !== 'Todos'
  ) {
    whereCategoria.tutoriales_tips = tutoriales_tips;
  }

  const favoritos = await Clase.findAll({
    where: whereCategoria,

    include: [
      {
        model: Favorito,
        as: 'favorito',
        where: { usuario_id: sessionUser.id },
      },
    ],
    order: [['createdAt', order ? order : 'desc']],
    limit: cuatro_ultimos === 'true' ? 4 : undefined, // solo si cuatro_ultimos es true
  });

  return res.status(200).json({
    status: 'success',
    favoritos,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const favoritos = await Favorito.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['clase_id'], // <- solo traemos clase_id
  });

  const claseIds = favoritos.map((like) => like.clase_id);

  return res.status(200).json({
    status: 'success',
    results: claseIds.length,
    favoritos: claseIds,
  });
});

// POST /like-clase/:id
export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, clase } = req;

  const existingFavorito = await Favorito.findOne({
    where: {
      usuario_id: sessionUser.id,
      clase_id: clase.id,
    },
  });

  if (existingFavorito) {
    return next(new AppError('Ya diste like a esta clase', 400));
  }

  await Favorito.create({
    usuario_id: sessionUser.id,
    clase_id: clase.id,
  });

  await clase.update({ nro_likes: clase.nro_likes + 1 });

  const favoritos = await Favorito.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['clase_id'],
  });

  const claseIds = favoritos.map((like) => like.clase_id);

  return res.status(201).json({
    status: 'success',
    message: 'El like se ha creado correctamente',
    favoritos: claseIds,
  });
});

// DELETE /like-clase/:id
export const deleteLikeClase = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // id de la clase

  const favorito = await Favorito.findOne({
    where: { clase_id: id, usuario_id: sessionUser.id },
  });

  if (!favorito) {
    return next(
      new AppError(`Like de esta clase no encontrado para este usuario`, 404)
    );
  }

  await favorito.destroy();

  const favoritos = await Favorito.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['clase_id'],
  });

  const claseIds = favoritos.map((like) => like.clase_id);

  return res.status(200).json({
    status: 'success',
    message: 'El like ha sido eliminado correctamente!',
    results: claseIds.length,
    favoritos: claseIds,
  });
});
