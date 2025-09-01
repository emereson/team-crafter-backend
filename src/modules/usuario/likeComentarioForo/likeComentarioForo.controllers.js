import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ComentarioForo } from '../../modulesForos/comentarioForo/comentarioForo.model.js';
import { LikeComentarioForo } from './likeComentarioForo.model.js';

// GET /like-clase
export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const likeComentarioForos = await LikeComentarioForo.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['comentario_foro_id'],
  });

  const comentarioForosId = likeComentarioForos.map(
    (like) => like.comentario_foro_id
  );

  return res.status(200).json({
    status: 'success',
    results: comentarioForosId.length,
    likeComentarioForos: comentarioForosId,
  });
});

// POST /like-clase/:id
export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, comentarioForo } = req;

  const existingLike = await LikeComentarioForo.findOne({
    where: {
      usuario_id: sessionUser.id,
      comentario_foro_id: comentarioForo.id,
    },
  });

  if (existingLike) {
    return next(new AppError('Ya diste like a esta clase', 400));
  }

  await LikeComentarioForo.create({
    usuario_id: sessionUser.id,
    comentario_foro_id: comentarioForo.id,
  });

  await comentarioForo.update({
    likes_comentario_foro: comentarioForo.likes_comentario_foro + 1,
  });

  const likeComentarioForo = await LikeComentarioForo.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['comentario_foro_id'],
  });

  const comentarioForoId = likeComentarioForo.map(
    (like) => like.comentario_foro_id
  );

  return res.status(201).json({
    status: 'success',
    message: 'El like se ha creado correctamente',
    likeComentarioForos: comentarioForoId,
  });
});

// DELETE /like-clase/:id
export const deleteLikeComentarioForo = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // id de la clase

  const likeComentarioForo = await LikeComentarioForo.findOne({
    where: { comentario_foro_id: id, usuario_id: sessionUser.id },
  });

  if (!likeComentarioForo) {
    return next(
      new AppError(`Like de esta clase no encontrado para este usuario`, 404)
    );
  }

  await likeComentarioForo.destroy();

  const comentarioForo = await ComentarioForo.findByPk(id);
  if (comentarioForo) {
    await comentarioForo.update({
      likes_comentario_foro: Math.max(
        comentarioForo.likes_comentario_foro - 1,
        0
      ),
    });
  }

  const newLikeComentarioForo = await LikeComentarioForo.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['comentario_foro_id'],
  });

  const comentarioForoId = newLikeComentarioForo.map(
    (like) => like.comentario_foro_id
  );

  return res.status(200).json({
    status: 'success',
    message: 'El like ha sido eliminado correctamente!',
    results: comentarioForoId.length,
    likeComentarioForos: comentarioForoId,
  });
});
