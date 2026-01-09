import { Recurso } from './recurso.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { deleteImage, uploadImage } from '../../utils/serverImage.js';
import { Clase } from '../modulesClases/clase/clase.model.js';
import { sendRecursoCaducado } from '../../utils/nodemailer.js';
import { Notificaciones } from '../notificaciones/notificaciones.model.js';
import { CategoriaRecursoId } from './categoriaRecursoId.model.js';
import { TipoRecursoId } from './tipoRecursoId.model.js';
import { CategoriaRecurso } from '../ajustes/categoriaRecurso/categoriaRecurso.model.js';
import { TipoRecurso } from '../ajustes/tipoRecurso/tipoRecurso.model.js';
import { Op } from 'sequelize';
import { Descargas } from '../usuario/descargas/descargas.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { categoria_recurso, tipo_recurso, cuatro_ultimos, order } = req.query;

  let whereCategoria = {};
  let whereTip = {};

  if (categoria_recurso && categoria_recurso.length > 0) {
    const categoriasArray = categoria_recurso
      .split(',')
      .map((cat) => cat.trim());
    if (categoriasArray.length > 0 && !categoriasArray.includes('Todos')) {
      whereCategoria.categoria_recurso_id = {
        [Op.in]: categoriasArray,
      };
    }
  }

  // Manejar filtros múltiples para tutoriales
  if (tipo_recurso && tipo_recurso.length > 0) {
    const tutorialesArray = tipo_recurso.split(',').map((tut) => tut.trim());
    if (tutorialesArray.length > 0 && !tutorialesArray.includes('Todos')) {
      whereTip.tipo_recurso_id = {
        [Op.in]: tutorialesArray,
      };
    }
  }

  const recursos = await Recurso.findAll({
    include: [
      { model: Clase, as: 'clase' },
      {
        model: CategoriaRecursoId,
        as: 'categorias_ids',
        where: whereCategoria,
        required: false,
        include: [{ model: CategoriaRecurso, as: 'categoria_recurso' }],
      },
      {
        model: TipoRecursoId,
        as: 'tipos_ids',
        where: whereTip,
        required: false,
        include: [{ model: TipoRecurso, as: 'tipo_recurso' }],
      },
    ],
    order: [['createdAt', order ? order : 'desc']],
    limit: cuatro_ultimos === 'true' ? 3 : undefined, // solo si cuatro_ultimos es true
  });

  return res.status(200).json({
    status: 'Success',
    results: recursos.length,
    recursos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { recurso } = req;

  return res.status(200).json({
    status: 'Success',
    recurso,
  });
});

export const createRecurso = catchAsync(async (req, res, next) => {
  const { clase } = req;
  const {
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso_id,
    categoria_recurso_id,
  } = req.body;

  const imagen = req.files?.img ? req.files.img[0] : null;
  const documento = req.files?.doc ? req.files.doc[0] : null;

  const categoriasArray = categoria_recurso_id
    ? String(categoria_recurso_id).split(',').map(Number).filter(Boolean)
    : [];

  const tipsArray = tipo_recurso_id
    ? String(tipo_recurso_id).split(',').map(Number).filter(Boolean)
    : [];

  const recurso = await Recurso.create({
    clase_id: clase.id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    img_recurso: await uploadImage(imagen),
    link_recurso: await uploadImage(documento),
    fecha_caducidad,
  });

  await Promise.all(
    categoriasArray.map((categoriaId) =>
      CategoriaRecursoId.create({
        recurso_id: recurso.id,
        categoria_recurso_id: categoriaId,
      })
    )
  );

  await Promise.all(
    tipsArray.map((tipId) =>
      TipoRecursoId.create({
        recurso_id: recurso.id,
        tipo_recurso_id: tipId,
      })
    )
  );

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion: 'noticias',
    titulo: 'Nuevo recurso añadido',
    contenido: `Descargar el nuevo ${nombre_recurso}`,
  });

  res.status(201).json({
    status: 'success',
    message: 'the recurso has been created successfully!',
    recurso,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    clase_id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso_id,
    categoria_recurso_id,
  } = req.body;

  const imagen = req.files?.img ? req.files.img[0] : null;
  const documento = req.files?.doc ? req.files.doc[0] : null;

  const categoriasArray = categoria_recurso_id
    ? String(categoria_recurso_id).split(',').map(Number).filter(Boolean)
    : [];

  const tipsArray = tipo_recurso_id
    ? String(tipo_recurso_id).split(',').map(Number).filter(Boolean)
    : [];

  const recurso = await Recurso.create({
    clase_id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    img_recurso: await uploadImage(imagen),
    link_recurso: await uploadImage(documento),
    fecha_caducidad,
  });

  await Promise.all(
    categoriasArray.map((categoriaId) =>
      CategoriaRecursoId.create({
        recurso_id: recurso.id,
        categoria_recurso_id: categoriaId,
      })
    )
  );

  await Promise.all(
    tipsArray.map((tipId) =>
      TipoRecursoId.create({
        recurso_id: recurso.id,
        tipo_recurso_id: tipId,
      })
    )
  );

  await Notificaciones.create({
    notificacion_global: true,
    tipo_notificacion: 'noticias',
    titulo: 'Nuevo recurso añadido',
    contenido: `Descargar el nuevo ${nombre_recurso}`,
  });

  res.status(201).json({
    status: 'success',
    message: 'the recurso has been created successfully!',
    recurso,
  });
});

export const updateRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;
  const {
    clase_id,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
    tipo_recurso_id,
    categoria_recurso_id,
  } = req.body;

  const imagen = req.files?.img ? req.files.img[0] : null;
  const documento = req.files?.doc ? req.files.doc[0] : null;

  const categoriasArray = categoria_recurso_id
    ? String(categoria_recurso_id).split(',').map(Number).filter(Boolean)
    : [];

  const tipsArray = tipo_recurso_id
    ? String(tipo_recurso_id).split(',').map(Number).filter(Boolean)
    : [];

  await TipoRecursoId.destroy({ where: { recurso_id: recurso.id } });
  await CategoriaRecursoId.destroy({ where: { recurso_id: recurso.id } });

  const updateData = {
    clase_id: clase_id ? clase_id : null,
    nombre_recurso,
    nombre_recurso_en,
    descripcion_recurso,
    fecha_caducidad,
  };

  await Promise.all(
    categoriasArray.map((categoriaId) =>
      CategoriaRecursoId.create({
        recurso_id: recurso.id,
        categoria_recurso_id: categoriaId,
      })
    )
  );

  await Promise.all(
    tipsArray.map((tipId) =>
      TipoRecursoId.create({
        recurso_id: recurso.id,
        tipo_recurso_id: tipId,
      })
    )
  );

  if (imagen) {
    if (recurso.img_recurso) {
      await deleteImage(recurso.img_recurso);
    }
    updateData.img_recurso = await uploadImage(imagen);
  }

  if (documento) {
    if (recurso.link_recurso) {
      await deleteImage(recurso.link_recurso);
    }
    updateData.link_recurso = await uploadImage(documento);
  }

  await recurso.update(updateData);

  const updatedRecurso = await recurso.reload();

  return res.status(200).json({
    status: 'success',
    message: 'recurso information has been updated',
    updatedRecurso,
  });
});

export const expirado = catchAsync(async (req, res, next) => {
  const { recurso, sessionUser } = req;
  const { mensaje } = req.body;
  await sendRecursoCaducado(
    recurso.nombre_recurso,
    sessionUser.correo,
    mensaje
  );

  return res.status(200).json({
    status: 'Success',
  });
});

export const deleteRecurso = catchAsync(async (req, res) => {
  const { recurso } = req;

  await Descargas.destroy({
    where: { recurso_id: recurso.id },
  });

  await TipoRecursoId.destroy({
    where: { recurso_id: recurso.id },
  });

  await CategoriaRecursoId.destroy({
    where: { recurso_id: recurso.id },
  });

  await recurso.destroy();

  if (recurso.link_recurso) {
    await deleteImage(recurso.link_recurso);
  }

  if (recurso.img_recurso) {
    await deleteImage(recurso.img_recurso);
  }

  return res.status(200).json({
    status: 'success',
    message: `The recurso with id: ${recurso.id} has been deleted`,
  });
});
