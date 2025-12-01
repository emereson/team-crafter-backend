import { catchAsync } from '../../../utils/catchAsync.js';
import { ComentarioForo } from './comentarioForo.model.js';
import { User } from '../../usuario/user/user.model.js';
import { RespuestaComentarioForo } from '../respuestaComentarioForo/respuestaComentarioForo.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comentarioForos = await ComentarioForo.findAll({
    where: {
      foro_id: id,
    },
    include: [
      {
        model: User,
        as: 'usuario',
        attributes: ['id', 'nombre', 'apellidos', 'foto_perfil'],
      },
      {
        model: RespuestaComentarioForo,
        as: 'respuesta_comentarios_foros',
        attributes: ['id'],
      },
    ],
    order: [['created_at', 'DESC']],
  });
  return res.status(200).json({
    status: 'Success',
    results: comentarioForos.length,
    comentarioForos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { comentarioForo } = req;

  return res.status(200).json({
    status: 'Success',
    comentarioForo,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, foro } = req;
  const { comentario } = req.body;

  const comentarioForo = await ComentarioForo.create({
    user_id: sessionUser.id,
    foro_id: foro.id,
    comentario,
  });

  res.status(201).json({
    status: 'success',
    message: 'the comentarioForo has been created successfully!',
    comentarioForo,
  });
});

export const update = catchAsync(async (req, res) => {
  const { comentarioForo } = req;
  const { comentario } = req.body;

  await comentarioForo.update({
    comentario,
  });

  return res.status(200).json({
    status: 'success',
    message: 'foro information has been updated',
    comentarioForo,
  });
});

export const deleteComentarioForo = catchAsync(async (req, res) => {
  const { comentarioForo } = req;

  await comentarioForo.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The comentarioForo with id: ${comentarioForo.id} has been deleted`,
  });
});
