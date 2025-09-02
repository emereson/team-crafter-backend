import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { AppError } from '../../../utils/AppError.js';
import { generateJWT } from '../../../utils/jwt.js';
import crypto from 'node:crypto';
import {
  sendConfirmationEmail,
  sendPasswordRecoveryEmail,
} from '../../../utils/nodemailer.js';
import { deleteImage } from '../../../utils/deleteUploads.js';
import { ConfigNotificaciones } from '../configNotificaciones/configNotificaciones.model.js';
import { createCustomerFlow } from '../../../services/flow.service.js';

export const findAll = catchAsync(async (req, res, next) => {
  const users = await User.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: users.length,
    users,
  });
});

export const findPerfil = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const perfil = await User.findOne({
    where: { id: sessionUser.id },
  });

  return res.status(200).json({
    status: 'Success',
    perfil,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { user } = req;

  return res.status(200).json({
    status: 'Success',
    user,
  });
});

export const signup = catchAsync(async (req, res, next) => {
  const { nombre, apellidos, correo, password, telefono, codigo_pais, plan } =
    req.body;

  const encryptedPassword = await bcrypt.hash(password, 12);

  // Generar token de verificación único
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    nombre,
    apellidos,
    correo,
    password: encryptedPassword,
    telefono,
    codigo_pais,
    verificationToken,
  });

  sendConfirmationEmail(nombre, correo.toLowerCase(), verificationToken, plan);
  const token = await generateJWT(user.id);

  await ConfigNotificaciones.create({
    usuario_id: user.id,
  });

  res.status(201).json({
    status: 'success',
    message:
      'the user has been created successfully! Please verify your email.',
    token,
    user,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { correo, password } = req.body;

  const user = await User.findOne({
    where: {
      correo,
      correo: correo.toLowerCase(),
      status: 'active',
    },
  });
  if (!user) {
    return next(new AppError('El usuario no se encuentra registrado', 404));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  const token = await generateJWT(user.id);

  res.status(201).json({
    status: 'success',
    token,
    user,
  });
});

export const correoRecuperarPassword = catchAsync(async (req, res) => {
  const { correo } = req.body;

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.findOne({
    where: { correo: correo?.toLowerCase() },
  });

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Token inválido o usuario no encontrado',
    });
  }

  user.verificationToken = verificationToken;

  await user.save();

  sendPasswordRecoveryEmail(
    user.nombre,
    correo.toLowerCase(),
    verificationToken
  );

  res.status(200).json({
    status: 'success',
  });
});

export const verificarCorreo = catchAsync(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: { verificationToken: token },
  });

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Token inválido o usuario no encontrado',
    });
  }

  // Actualizar el estado de verificación
  user.emailVerified = true;
  user.verificationToken = null;

  const resFlow = await createCustomerFlow({
    name: `${user.nombre} ${user.apellidos}`,
    email: user.correo,
    external_id: user.id,
  });

  user.customerId = resFlow.customerId;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Correo verificado con éxito',
    user,
  });
});

export const nuevoPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log(password);

  const encryptedPassword = await bcrypt.hash(password, 12);

  const user = await User.findOne({
    where: { verificationToken: token },
  });

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Token inválido o usuario no encontrado',
    });
  }

  // Actualizar el estado de verificación
  user.password = encryptedPassword;
  user.verificationToken = null; // 👈 opcional: limpiar el token para que no se reutilice
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'nueva contraseña con éxito',
    user,
  });
});

export const update = catchAsync(async (req, res) => {
  const { user } = req;
  const {
    nombre,
    apellidos,
    telefono,
    codigo_pais,
    zona_horaria,
    dni_id_ce,
    newPassword,
  } = req.body;

  const updateData = {
    nombre,
    apellidos,
    telefono,
    codigo_pais,
    zona_horaria,
    dni_id_ce,
  };

  if (req.file) {
    if (user.foto_perfil) {
      await deleteImage(user.foto_perfil);
    }

    updateData.foto_perfil = req.file.filename;
  }

  if (newPassword.length > 3) {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash(newPassword, salt);

    updateData.password = encryptedPassword;
  }

  await user.update(updateData);

  const updatedUser = await user.reload();

  return res.status(200).json({
    status: 'success',
    message: 'User information has been updated',
    user: updatedUser,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { user } = req;

  await user.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${user.id} has been deleted`,
  });
});
