import { ComentarioClase } from './comentarioClase.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { User } from '../../usuario/user/user.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  const comentarios = await ComentarioClase.findAll({
    where: {
      clase_id: id,
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
    results: comentarios.length,
    comentarios,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, clase } = req;

  const { comentario } = req.body;

  const comentarioClase = await ComentarioClase.create({
    clase_id: clase.id,
    user_id: sessionUser.id,
    comentario,
  });

  res.status(201).json({
    status: 'Success',
    message: 'the comentarioClase has been created successfully!',
    comentarioClase,
  });
});
