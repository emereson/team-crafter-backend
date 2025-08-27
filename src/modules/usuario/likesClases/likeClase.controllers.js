import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Clase } from '../../modulesClases/clase/clase.model.js';
import { LikeClase } from './likeClase.model.js';

// GET /like-clase
export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const likeClases = await LikeClase.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['clase_id'], // <- solo traemos clase_id
  });

  const claseIds = likeClases.map((like) => like.clase_id);

  return res.status(200).json({
    status: 'success',
    results: claseIds.length,
    likeClases: claseIds,
  });
});

// POST /like-clase/:id
export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, clase } = req;

  const existingLike = await LikeClase.findOne({
    where: {
      usuario_id: sessionUser.id,
      clase_id: clase.id,
    },
  });

  if (existingLike) {
    return next(new AppError('Ya diste like a esta clase', 400));
  }

  await LikeClase.create({
    usuario_id: sessionUser.id,
    clase_id: clase.id,
  });

  await clase.update({ nro_likes: clase.nro_likes + 1 });

  const likeClases = await LikeClase.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['clase_id'],
  });

  const claseIds = likeClases.map((like) => like.clase_id);

  return res.status(201).json({
    status: 'success',
    message: 'El like se ha creado correctamente',
    likeClases: claseIds,
  });
});

// DELETE /like-clase/:id
export const deleteLikeClase = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // id de la clase

  const likeClase = await LikeClase.findOne({
    where: { clase_id: id, usuario_id: sessionUser.id },
  });

  if (!likeClase) {
    return next(
      new AppError(`Like de esta clase no encontrado para este usuario`, 404)
    );
  }

  await likeClase.destroy();

  const clase = await Clase.findByPk(id);
  if (clase) {
    await clase.update({ nro_likes: Math.max(clase.nro_likes - 1, 0) });
  }

  const newLikeClases = await LikeClase.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['clase_id'],
  });

  const claseIds = newLikeClases.map((like) => like.clase_id);

  return res.status(200).json({
    status: 'success',
    message: 'El like ha sido eliminado correctamente!',
    results: claseIds.length,
    likeClases: claseIds,
  });
});
