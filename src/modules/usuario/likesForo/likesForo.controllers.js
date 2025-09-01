import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Foro } from '../../modulesForos/foro/foro.model.js';
import { LikeForo } from './likesForo.model.js';

// GET /like-clase
export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const likeForos = await LikeForo.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['foro_id'],
  });

  const foroIds = likeForos.map((like) => like.foro_id);

  console.log(foroIds);

  return res.status(200).json({
    status: 'success',
    results: foroIds.length,
    likeForos: foroIds,
  });
});

// POST /like-clase/:id
export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, foro } = req;

  const existingLike = await LikeForo.findOne({
    where: {
      usuario_id: sessionUser.id,
      foro_id: foro.id,
    },
  });

  if (existingLike) {
    return next(new AppError('Ya diste like a esta foro', 400));
  }

  await LikeForo.create({
    usuario_id: sessionUser.id,
    foro_id: foro.id,
  });

  await foro.update({ likes_foro: foro.likes_foro + 1 });

  const likeForos = await LikeForo.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['foro_id'],
  });

  const foroIds = likeForos.map((like) => like.foro_id);

  return res.status(201).json({
    status: 'success',
    message: 'El like se ha creado correctamente',
    likeForos: foroIds,
  });
});

// DELETE /like-foro/:id
export const deleteLikeForo = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // id de la foro

  const likeForo = await LikeForo.findOne({
    where: { foro_id: id, usuario_id: sessionUser.id },
  });

  if (!likeForo) {
    return next(
      new AppError(`Like de esta clase no encontrado para este usuario`, 404)
    );
  }

  await likeForo.destroy();

  const foro = await Foro.findByPk(id);
  if (foro) {
    await foro.update({ likes_foro: Math.max(foro.likes_foro - 1, 0) });
  }

  const newLikeForos = await LikeForo.findAll({
    where: { usuario_id: sessionUser.id },
    attributes: ['foro_id'],
  });

  const foro_idIds = newLikeForos.map((like) => like.foro_id);

  return res.status(200).json({
    status: 'success',
    message: 'El like ha sido eliminado correctamente!',
    results: foro_idIds.length,
    likeForos: foro_idIds,
  });
});
