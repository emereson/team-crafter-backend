import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Suscripcion } from '../suscripcion/suscripcion.model.js';
import { User } from './user.model.js';

export const validExistUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    where: {
      id,
    },
  });

  if (!user) {
    return next(new AppError(`user with id: ${id} not found `, 404));
  }

  req.user = user;
  next();
});

export const verificarSuscripcionActiva = async (req, res, next) => {
  try {
    const userId = req.sessionUser?.id; // o req.user.id según tu auth
    if (!userId)
      return res.status(401).json({ error: 'Usuario no autorizado' });

    const suscripcion = await Suscripcion.findOne({
      where: {
        user_id: userId,
        status: 'activa',
      },
    });

    if (!suscripcion) {
      return res
        .status(403)
        .json({ error: 'No tienes una suscripción activa' });
    }

    if (suscripcion.endDate && suscripcion.endDate < new Date()) {
      // actualizar status automáticamente
      await suscripcion.update({ status: 'expirada' });
      return res.status(403).json({ error: 'Tu suscripción ha expirado' });
    }

    req.suscripcion = suscripcion; // guardar info en request
    next();
  } catch (err) {
    next(err);
  }
};
