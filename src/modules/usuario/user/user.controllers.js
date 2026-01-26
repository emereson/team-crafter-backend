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
import { ConfigNotificaciones } from '../configNotificaciones/configNotificaciones.model.js';
import {
  createCustomerFlow,
  createSubscriptionFlow,
  datosCliente,
  registrarTarjeta,
  resultadoRegistroTarjeta,
} from '../../../services/flow.service.js';
import { Suscripcion } from '../suscripcion/suscripcion.model.js';
import { getSubscriptionPayPal } from '../../../services/paypal.service.js';
import { Plan } from '../../plan/plan.model.js';
import { uploadImage, deleteImage } from '../../../utils/serverImage.js';
import { fn, col, Op, literal } from 'sequelize';

export const findAll = catchAsync(async (req, res, next) => {
  const users = await User.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: users.length,
    users,
  });
});

export const findAllAnalytics = catchAsync(async (req, res, next) => {
  const currentYear = new Date().getFullYear();

  const usersByMonth = await User.findAll({
    attributes: [
      [fn('MONTH', col('createdAt')), 'month'],
      [fn('COUNT', col('id')), 'total'],
    ],
    where: {
      status: 'active',
      createdAt: {
        [Op.between]: [
          new Date(`${currentYear}-01-01 00:00:00`),
          new Date(`${currentYear}-12-31 23:59:59`),
        ],
      },
    },
    group: [fn('MONTH', col('createdAt'))],
    order: [[literal('month'), 'ASC']],
    raw: true,
  });

  // 🔹 Formatear meses para frontend
  const MONTHS = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  const formattedData = usersByMonth.map((item) => ({
    month: MONTHS[item.month - 1],
    total: Number(item.total),
  }));

  return res.status(200).json({
    status: 'success',
    year: currentYear,
    data: formattedData,
  });
});

export const findPerfilSuscripciones = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const perfil = await User.findOne({
    where: { id: sessionUser.id },
  });

  return res.status(200).json({
    status: 'Success',
    perfil,
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
  const {
    nombre,
    apellidos,
    correo,
    password,
    telefono,
    pais,
    plan,
    dni_id_ce,
  } = req.body;

  const userExist = await User.findOne({
    where: {
      correo: correo.toLowerCase(),
    },
  });
  if (userExist) {
    return next(
      new AppError(
        `El correo ${correo.toLowerCase()} ya se encuentra registrado`,
        404,
      ),
    );
  }

  const encryptedPassword = await bcrypt.hash(password, 12);

  // Generar token de verificación único
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    nombre,
    apellidos,
    correo: correo.toLowerCase(),
    password: encryptedPassword,
    telefono,
    pais,
    verificationToken,
    dni_id_ce,
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
      correo: correo.toLowerCase(),
      status: 'active',
    },
  });
  if (!user) {
    return next(new AppError('El usuario no se encuentra registrado', 404));
  }

  if (
    !(await bcrypt.compare(password, user.password ? user.password : 'asd'))
  ) {
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
    verificationToken,
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

  // use. =resTarjeta

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
    pais,
  } = req.body;

  const updateData = {
    nombre,
    apellidos,
    telefono,
    codigo_pais,
    zona_horaria,
    dni_id_ce,
    pais,
  };

  const fileAnterior = user.foto_perfil;

  if (req.file) {
    updateData.foto_perfil = await uploadImage(req.file);
  }

  if (newPassword.length > 3) {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash(newPassword, salt);

    updateData.password = encryptedPassword;
  }

  await user.update(updateData);

  if (fileAnterior) {
    await deleteImage(fileAnterior);
  }

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

export const finRegistrarTarjeta = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const perfil = await User.findOne({
    where: { id: sessionUser.id },
  });

  const cliente = await datosCliente({ customerId: sessionUser.customerId });

  const resTarjeta = await registrarTarjeta({
    customerId: sessionUser.customerId,
  });

  return res.status(200).json({
    status: 'Success',
    url: `${resTarjeta.url}?token=${resTarjeta.token}`,
    perfil,
  });
});

export const resultadoRegistrarTarjeta = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  // 1. Consultamos a Flow por el registro de la tarjeta
  const response = await resultadoRegistroTarjeta({ token });

  // 3. Buscamos la última suscripción pendiente de ese usuario
  const suscripcion = await Suscripcion.findOne({
    where: { status: 'pendiente', customerId: response.customerId },

    order: [['createdAt', 'DESC']], // 👈 aquí aseguramos la última
  });

  if (!suscripcion) {
    return res.status(404).json({
      status: 'Error',
      message: 'No se encontró una suscripción pendiente para este cliente',
    });
  }
  // 4. Podrías generar las fechas de inicio
  const now = new Date();
  const startDate = now.toISOString().split('T')[0];

  const responseSus = await createSubscriptionFlow({
    planId: suscripcion?.dataValues?.plan_id_flow,
    customerId: response.customerId,
    subscription_start: startDate,
  });

  await suscripcion.update({
    status: 'activa',
    startDate: responseSus.period_start,
    endDate: responseSus.period_end,
    flow_subscription_id: responseSus.subscriptionId,
    status:
      responseSus.status === 1
        ? 'activa'
        : responseSus.status === 4
          ? 'cancelada'
          : 'pendiente',
  });
  res.redirect('https://app.team-crafter.com/compra-completada');
});

export const resultadoPaypal = catchAsync(async (req, res, next) => {
  const { subscription_id } = req.query;

  const resPayal = await getSubscriptionPayPal({ subscription_id });

  const suscripcion = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscription_id },

    order: [['createdAt', 'DESC']], // 👈 aquí aseguramos la última
  });

  const start = new Date(resPayal.start_time);
  const end = new Date(start);

  if (suscripcion.plan_id === 1) {
    end.setMonth(end.getMonth() + 1);
  } else if (suscripcion.plan_id === 2) {
    end.setMonth(end.getMonth() + 6);
  } else if (suscripcion.plan_id === 3) {
    end.setMonth(end.getMonth() + 12);
  }

  if (resPayal.status === 'ACTIVE') {
    await suscripcion.update({
      status: 'activa',
      startDate: start,
      endDate: end,
    });
  } else {
    await suscripcion.update({ status: 'cancelada' });
  }

  res.redirect('https://app.team-crafter.com/compra-completada');
  // res.redirect('http://localhost:3000/compra-completada');
});

export const datosClienteFlow = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const datosClientes = await datosCliente({
    customerId: id,
  });

  return res.status(200).json({
    status: 'success',
    datosClientes: datosClientes,
  });
});

export const migrarPaypal = catchAsync(async (req, res, next) => {
  const { subscription_id } = req.query;

  const resPayal = await getSubscriptionPayPal({ subscription_id });

  const suscripcion = await Suscripcion.findOne({
    where: { suscripcion_id_paypal: subscription_id },
  });

  const plan = await Plan.findOne({
    where: {
      paypal_plan_id: resPayal.plan_id,
    },
  });

  const start = new Date(resPayal.start_time);
  const end = new Date(start);

  if (plan.id === 1) {
    end.setMonth(end.getMonth() + 1);
  } else if (plan.id === 2) {
    end.setMonth(end.getMonth() + 6);
  } else if (plan.id === 3) {
    end.setMonth(end.getMonth() + 12);
  }

  if (resPayal.status === 'ACTIVE') {
    await suscripcion.update({
      status: 'activa',
      startDate: start,
      endDate: end,
      plan_id: plan.id,
    });
  }

  res.redirect('https://app.team-crafter.com/compra-completada');
  // res.redirect('http://localhost:3000/dashboard/mi-cuenta');
});
