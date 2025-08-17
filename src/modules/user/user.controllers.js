import bcrypt from "bcryptjs";
import { User } from "./user.model.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { generateJWT } from "../../utils/jwt.js";

export const findAll = catchAsync(async (req, res, next) => {
  const users = await User.findAll({});

  return res.status(200).json({
    status: "Success",
    results: users.length,
    users,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { user } = req;

  return res.status(200).json({
    status: "Success",
    user,
  });
});

export const signup = catchAsync(async (req, res, next) => {
  const { nombre, correo, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    nombre,
    correo,
    password: encryptedPassword,
  });

  const token = await generateJWT(user.id);

  res.status(201).json({
    status: "success",
    message: "the user has been created successfully!",
    token,
    user,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { correo, password } = req.body;

  const user = await User.findOne({
    where: {
      correo,
      status: "active",
    },
  });
  if (!user) {
    return next(new AppError("El usuario no se encuentra registrado", 404));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Contraseña incorrecta", 401));
  }

  const token = await generateJWT(user.id);

  res.status(201).json({
    status: "success",
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
    },
  });
});

export const update = catchAsync(async (req, res) => {
  const { user } = req;
  const { nombre, newPassword } = req.body;

  if (newPassword.length > 3) {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      nombre,

      password: encryptedPassword,
    });
  } else {
    await user.update({
      nombre,
    });
  }

  return res.status(200).json({
    status: "success",
    message: "User information has been updated",
    user,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { user } = req;

  await user.destroy();

  return res.status(200).json({
    status: "success",
    message: `The user with id: ${user.id} has been deleted`,
  });
});
