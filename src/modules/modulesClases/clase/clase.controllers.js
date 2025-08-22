import { Clase } from './clase.model.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Plan } from '../../plan/plan.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const clases = await Clase.findAll({});
  const planes = [
    {
      id: 1,
      nombre_plan: 'Plan Básico',
      precio_plan: 5,
      titulo: ' Paga por 1 mes',
      descripcion: '*30 días de contenido exclusivo',
      color_card: '#FFEE97',
      color_principal: '#FFE251',
      color_text: '#8A8A8A',
      ruta_img: '/planes/planB.png',
    },
    {
      id: 2,
      nombre_plan: 'Plan Estándar',
      precio_plan: 27,
      titulo: ' Paga por 6 meses y ahorra 10%',
      descripcion: '*precio regular $30USD',
      color_card: '#C3F3F3',
      color_principal: '#68E1E0',
      color_text: '#8A8A8A',
      ruta_img: '/planes/planE.png',
    },
    {
      id: 3,
      nombre_plan: 'Plan Pro Crafter',
      precio_plan: 55,
      titulo: 'Paga una vez al año',
      descripcion: '*precio regular $60USD',
      color_card: '#FFB4DF',
      color_principal: '#FC68B9',
      color_text: '#ffffff',
      ruta_img: '/planes/planPro.png',
    },
  ];

  await Promise.all(
    planes.map((p) =>
      Plan.create({
        nombre_plan: p.nombre_plan,
        precio_plan: p.precio_plan,
      })
    )
  );

  return res.status(200).json({
    status: 'Success',
    results: clases.length,
    clases,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { clase } = req;

  return res.status(200).json({
    status: 'Success',
    clase,
  });
});

export const createClase = catchAsync(async (req, res, next) => {
  const {
    imagen_clase,
    titulo_clase,
    tiempo_duracion_video,
    nro_reproducciones,
  } = req.body;

  const clase = await Clase.create({
    imagen_clase,
    titulo_clase,
    descripcion_clase,
    tiempo_duracion_video,
    nro_reproducciones,
    nro_likes,
  });

  res.status(201).json({
    status: 'success',
    message: 'the clase has been created successfully!',
    token,
    clase,
  });
});

export const updateClase = catchAsync(async (req, res) => {
  const { clase } = req;
  const {
    imagen_clase,
    titulo_clase,
    descripcion_clase,
    tiempo_duracion_video,
    nro_reproducciones,
    nro_likes,
  } = req.body;

  await clase.update({
    imagen_clase,
    titulo_clase,
    descripcion_clase,
    tiempo_duracion_video,
    nro_reproducciones,
    nro_likes,
  });

  return res.status(200).json({
    status: 'success',
    message: 'clase information has been updated',
    clase,
  });
});

export const deleteClase = catchAsync(async (req, res) => {
  const { clase } = req;

  await clase.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The clase with id: ${clase.id} has been deleted`,
  });
});
