import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ComentarioClase } from '../../modulesClases/comentarioClase/comentarioClase.model.js';
import { LikeComentarioClases } from './likeComentarioClase.model.js';

// GET /like-clase
export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const likeComentarioClases = await LikeComentarioClases.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['comentario_clase_id'],
  });

  const comentarioClasesId = likeComentarioClases.map(
    (like) => like.comentario_clase_id
  );

  return res.status(200).json({
    status: 'success',
    results: comentarioClasesId.length,
    likeComentarioClases: comentarioClasesId,
  });
});

// POST /like-clase/:id
export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, comentarioClase } = req;

  const existingLike = await LikeComentarioClases.findOne({
    where: {
      usuario_id: sessionUser.id,
      comentario_clase_id: comentarioClase.id,
    },
  });

  if (existingLike) {
    return next(new AppError('Ya diste like a esta clase', 400));
  }

  await LikeComentarioClases.create({
    usuario_id: sessionUser.id,
    comentario_clase_id: comentarioClase.id,
  });

  await comentarioClase.update({ nro_likes: comentarioClase.nro_likes + 1 });

  const likeComentarioClases = await LikeComentarioClases.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['comentario_clase_id'],
  });

  const comentarioClaseId = likeComentarioClases.map(
    (like) => like.comentario_clase_id
  );

  return res.status(201).json({
    status: 'success',
    message: 'El like se ha creado correctamente',
    likeComentarioClases: comentarioClaseId,
  });
});

// DELETE /like-clase/:id
export const deleteLikeComentarioClases = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // id de la clase

  const likeComentarioClase = await LikeComentarioClases.findOne({
    where: { comentario_clase_id: id, usuario_id: sessionUser.id },
  });

  if (!likeComentarioClase) {
    return next(
      new AppError(`Like de esta clase no encontrado para este usuario`, 404)
    );
  }

  await likeComentarioClase.destroy();

  const comentarioClase = await ComentarioClase.findByPk(id);
  if (comentarioClase) {
    await comentarioClase.update({
      nro_likes: Math.max(comentarioClase.nro_likes - 1, 0),
    });
  }

  const newLikeComentarioClases = await LikeComentarioClases.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['comentario_clase_id'],
  });

  const comentarioClaseId = newLikeComentarioClases.map(
    (like) => like.comentario_clase_id
  );

  return res.status(200).json({
    status: 'success',
    message: 'El like ha sido eliminado correctamente!',
    results: comentarioClaseId.length,
    likeComentarioClases: comentarioClaseId,
  });
});
