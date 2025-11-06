import { catchAsync } from '../../../utils/catchAsync.js';
import { Recurso } from '../../recurso/recurso.model.js';
import { Descargas } from './descargas.model.js';

// GET /like-clase
export const findAll = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const descargas = await Descargas.findAll({
    where: { usuario_id: sessionUser.id },
    include: [{ model: Recurso, as: 'recurso' }],
  });

  return res.status(200).json({
    status: 'success',
    results: descargas.length,
    descargas,
  });
});

// POST /like-clase/:id
export const create = catchAsync(async (req, res, next) => {
  const { sessionUser, recurso } = req;

  const descarga = await Descargas.create({
    usuario_id: sessionUser.id,
    recurso_id: recurso.id,
    fecha_descarga: new Date(),
  });

  return res.status(201).json({
    status: 'success',
    message: 'La descarga se ha creado correctamente',
    descarga,
  });
});
