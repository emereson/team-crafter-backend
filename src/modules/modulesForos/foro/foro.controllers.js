import { catchAsync } from '../../../utils/catchAsync.js';
import { Foro } from './foro.model.js';
import { User } from '../../usuario/user/user.model.js';
import { ComentarioForo } from '../comentarioForo/comentarioForo.model.js';
import { deleteImage, uploadImage } from '../../../utils/serverImage.js';
import { Op } from 'sequelize';

export const findAll = catchAsync(async (req, res, next) => {
  const { order, titulo_foro } = req.query;

  const whereFilter = {};

  // Filtro por título
  if (titulo_foro) {
    whereFilter.titulo_foro = {
      [Op.like]: `%${titulo_foro}%`,
    };
  }

  // Validar orden
  const orderDirection = order === 'asc' || order === 'ASC' ? 'ASC' : 'DESC';

  const foros = await Foro.findAll({
    where: whereFilter,
    include: [
      { model: User, as: 'usuario' },
      { model: ComentarioForo, as: 'comentarios_foro' },
    ],
    order: [['created_at', orderDirection]],
  });

  return res.status(200).json({
    status: 'Success',
    results: foros.length,
    foros,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { foro } = req;

  return res.status(200).json({
    status: 'Success',
    foro,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { titulo_foro, contenido_foro, categoria_foro } = req.body;

  let img;

  if (req?.file) {
    img = await uploadImage(req?.file);
  }

  const foro = await Foro.create({
    user_id: sessionUser.id,
    titulo_foro,
    contenido_foro,
    categoria_foro,
    img_foro: img,
  });

  res.status(201).json({
    status: 'success',
    message: 'the foro has been created successfully!',
    foro,
  });
});

export const update = catchAsync(async (req, res) => {
  const { foro } = req;
  const { titulo_foro, contenido_foro, categoria_foro } = req.body;

  const updateData = {
    titulo_foro,
    contenido_foro,
    categoria_foro,
  };

  if (req.file) {
    if (foro.img_foro) {
      await deleteImage(foro.img_foro);
    }

    updateData.img_foro = uploadImage(req.file);
  }

  await foro.update({
    titulo_foro,
    contenido_foro,
    categoria_foro,
  });

  await foro.update(updateData);

  const updatedForo = await foro.reload();

  return res.status(200).json({
    status: 'success',
    message: 'foro information has been updated',
    updatedForo,
  });
});

export const deleteForo = catchAsync(async (req, res) => {
  const { foro } = req;

  if (foro.img_foro) {
    await deleteImage(foro.img_foro);
  }
  await foro.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The foro with id: ${foro.id} has been deleted`,
  });
});
