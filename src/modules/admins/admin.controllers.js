import bcrypt from 'bcryptjs';
import { Admin } from './admin.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { generateJWT } from '../../utils/jwt.js';
import { AppError } from '../../utils/AppError.js';
import { where } from 'sequelize';

export const findAll = catchAsync(async (req, res, next) => {
  const admins = await Admin.findAll({});

  const encryptedPassword = await bcrypt.hash('admin123', 12);

  await Admin.create({
    nombre: 'admin',
    correo: 'admin123@gmail.com',
    password: encryptedPassword,
  });

  return res.status(200).json({
    status: 'Success',
    results: admins.length,
    admins,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { admin } = req;

  return res.status(200).json({
    status: 'Success',
    admin,
  });
});

export const signup = catchAsync(async (req, res, next) => {
  const { nombre, correo, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 12);

  // Generar token de verificación único

  const admin = await Admin.create({
    nombre,
    correo,
    password: encryptedPassword,
  });

  const token = await generateJWT(admin.id);

  res.status(201).json({
    status: 'success',
    message:
      'the admin has been created successfully! Please verify your email.',
    token,
    admin,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { correo, password } = req.body;

  const admin = await Admin.findOne({
    where: {
      correo: correo.toLowerCase(),
      status: 'active',
    },
  });
  if (!admin) {
    return next(new AppError('El usuario no se encuentra registrado', 404));
  }

  if (!(await bcrypt.compare(password, admin.password))) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  const token = await generateJWT(admin.id);

  res.status(201).json({
    status: 'success',
    token,
    admin: {
      id: admin.id,
      nombre: admin.nombre,
      correo: admin.correo,
    },
  });
});

export const update = catchAsync(async (req, res) => {
  const { admin } = req;
  const { nombre, newPassword } = req.body;

  if (newPassword.length > 3) {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash(newPassword, salt);

    await admin.update({
      nombre,
      password: encryptedPassword,
    });
  } else {
    await admin.update({
      nombre,
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'admin information has been updated',
    admin,
  });
});

async function updateUser() {
  // Asegúrate de que 'nombre' venga de algún lugar (parámetro o variable)
  const nombre = 'Nuevo Nombre';

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash('Teamcrafter@2026', salt);

  await Admin.update(
    {
      password: encryptedPassword,
    }, // Fin del primer objeto (datos)
    {
      where: {
        id: 'dd757477-fce0-4892-a451-c4bcd49dc4dc', // Con comillas
      },
    }, // Fin del segundo objeto (opciones)
  );
}

// updateUser();

export const deleteAdmin = catchAsync(async (req, res) => {
  const { admin } = req;

  await admin.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The admin with id: ${admin.id} has been deleted`,
  });
});
