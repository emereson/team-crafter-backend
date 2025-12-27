import { catchAsync } from '../../../utils/catchAsync.js';
import { User } from '../../usuario/user/user.model.js';
import { RespuestaComentarioForo } from './respuestaComentarioForo.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const respuestas = await RespuestaComentarioForo.findAll({
    where: {
      comentario_foro_id: id,
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
  const { sessionUser, comentarioForo } = req;

  const { comentario, user_comentario_id } = req.body;

  const respuestaComentarioForo = await RespuestaComentarioForo.create({
    comentario_foro_id: comentarioForo.id,
    user_id: sessionUser.id,
    user_comentario_id,
    comentario,
  });

  res.status(201).json({
    status: 'Success',
    message: 'the respuestaComentarioForo has been created successfully!',
    respuestaComentarioForo,
  });
});

export const deleteItem = catchAsync(async (req, res) => {
  const { respuestaComentarioForo } = req;

  await respuestaComentarioForo.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The respuesta Comentario Foro with id: ${respuestaComentarioForo.id} has been deleted`,
  });
});
