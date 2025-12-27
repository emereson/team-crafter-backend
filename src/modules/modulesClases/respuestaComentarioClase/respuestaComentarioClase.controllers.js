import { RespuestaComentarioClase } from './respuestaComentarioClase.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { User } from '../../usuario/user/user.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const respuestas = await RespuestaComentarioClase.findAll({
    where: {
      comentario_clase_id: id,
    },
    include: [
      {
        model: User,
        as: 'usuario',
        attributes: ['id', 'nombre', 'apellidos', 'foto_perfil'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: respuestas.length,
    respuestas,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, comentarioClase } = req;

  const { comentario, user_comentario_id } = req.body;

  const respuestaComentarioClase = await RespuestaComentarioClase.create({
    comentario_clase_id: comentarioClase.id,
    user_id: sessionUser.id,
    user_comentario_id,
    comentario,
  });

  res.status(201).json({
    status: 'Success',
    message: 'the respuestaComentarioClase has been created successfully!',
    respuestaComentarioClase,
  });
});

export const deleteItem = catchAsync(async (req, res) => {
  const { respuestaComentarioClase } = req;

  await respuestaComentarioClase.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The respuestaComentarioClase with id: ${respuestaComentarioClase.id} has been deleted`,
  });
});
