import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Admin } from './admin.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in!, Please log in to get access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED
  );

  const admin = await Admin.findOne({
    where: {
      id: decoded.id,
      status: 'active',
    },
  });

  if (!admin) {
    return next(
      new AppError('The owner of this token is not longer available', 401)
    );
  }

  if (admin.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      admin.passwordChangedAt.getTime() / 1000,
      10
    );

    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError(
          'admin recently changed password!, please login again.',
          401
        )
      );
    }
  }

  req.sessionAdmin = admin;
  next();
});

export const protectAccountOwner = catchAsync(async (req, res, next) => {
  const { admin, sessionAdmin } = req;

  if (admin.id !== sessionAdmin.id) {
    return next(new AppError('You are not the owner of this account.', 401));
  }

  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.sessionAdmin.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }

    next();
  };
};
