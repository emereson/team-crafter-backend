import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Clase } from '../../modulesClases/clase/clase.model.js';
import { LikeClase } from './likeClase.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const likeClases = await LikeClase.findAll({
    where: {
      usuario_id: sessionUser.id,
    },
  });

  return res.status(200).json({
    status: 'Success',
    results: likeClases.length,
    likeClases,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { likeClase } = req;

  return res.status(200).json({
    status: 'Success',
    likeClase,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, clase } = req;

  // Validar si ya existe un like de este usuario para esta clase
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

  // Actualizar el contador de likes
  await clase.update({
    nro_likes: clase.nro_likes + 1,
  });

  // Obtener los likes actualizados del usuario (si realmente lo necesitas)
  const likeClases = await LikeClase.findAll({
    where: {
      usuario_id: sessionUser.id,
    },
  });

  return res.status(201).json({
    status: 'success',
    message: 'El like se ha creado correctamente',
    likeClases, // opcional
  });
});

export const update = catchAsync(async (req, res) => {
  const { sessionUser, clase, likeClase } = req;

  await likeClase.update({
    usuario_id: sessionUser.id,
    clase_id: clase.id,
  });

  return res.status(200).json({
    status: 'success',
    message: 'descuento information has been updated',
    descuento,
  });
});

export const deleteLikeClase = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // id de la clase

  const likeClase = await LikeClase.findOne({
    where: {
      clase_id: id,
      usuario_id: sessionUser.id, // validamos que sea del usuario logueado
    },
  });

  if (!likeClase) {
    return next(
      new AppError(`Like de esta clase no encontrado para este usuario`, 404)
    );
  }

  // eliminamos el like
  await likeClase.destroy();

  // buscamos la clase para actualizar el nro_likes
  const clase = await Clase.findByPk(id);

  if (clase) {
    await clase.update({
      nro_likes: clase.nro_likes > 0 ? clase.nro_likes - 1 : 0,
    });
  }

  // obtenemos los likes actualizados del usuario
  const newLikeClases = await LikeClase.findAll({
    where: {
      usuario_id: sessionUser.id,
    },
  });

  return res.status(200).json({
    status: 'success',
    message: 'El like ha sido eliminado correctamente!',
    results: newLikeClases.length,
    newLikeClases,
  });
});
