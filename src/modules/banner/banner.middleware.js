import { AppError } from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { Banner } from './banner.model.js';

export const validExistBanner = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const banner = await Banner.findOne({
    where: {
      id: id,
    },
  });

  if (!banner) {
    return next(new AppError(`banner with id: ${id} not found `, 404));
  }

  req.banner = banner;
  next();
});
