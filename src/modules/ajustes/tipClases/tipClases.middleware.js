import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { TipClase } from './tipClases.model.js';

export const validExistTipClase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const tip = await TipClase.findOne({
    where: {
      id,
    },
  });

  if (!tip) {
    return next(new AppError(`tip with id: ${id} not found `, 404));
  }

  req.tip = tip;
  next();
});
