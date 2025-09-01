import { catchAsync } from '../../../utils/catchAsync.js';
import { ConfigNotificaciones } from './configNotificaciones.model.js';

// GET /like-clase
export const findNotificaction = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const notificaciones = await ConfigNotificaciones.findOne({
    where: { usuario_id: sessionUser.id },
  });

  return res.status(200).json({
    status: 'success',
    notificaciones,
  });
});

// POST /like-clase/:id
export const update = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { noticias, promociones } = req.body;

  await ConfigNotificaciones.update(
    { noticias, promociones },
    { where: { usuario_id: sessionUser.id } }
  );

  const notificaciones = await ConfigNotificaciones.findOne({
    where: { usuario_id: sessionUser.id },
  });

  return res.status(201).json({
    status: 'success',
    notificaciones,
  });
});
