import { Descuento } from './descuento.model.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const findAll = catchAsync(async (req, res, next) => {
  const descuentos = await Descuento.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: descuentos.length,
    descuentos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { descuento } = req;

  return res.status(200).json({
    status: 'Success',
    descuento,
  });
});

export const createDescuento = catchAsync(async (req, res, next) => {
  const {
    titulo_descuento,
    titulo_descuento_en,
    descripcion_descuento,
    descripcion_descuento_en,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
    texto_2_es,
    texto_2_en,
    enlace_descuento,
  } = req.body;

  const descuento = await Descuento.create({
    titulo_descuento,
    titulo_descuento_en,
    descripcion_descuento,
    descripcion_descuento_en,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
    texto_2_es,
    texto_2_en,
    enlace_descuento,
  });

  res.status(201).json({
    status: 'success',
    message: 'the descuento has been created successfully!',
    descuento,
  });
});

export const updateDescuento = catchAsync(async (req, res) => {
  const { descuento } = req;
  const {
    titulo_descuento,
    titulo_descuento_en,
    descripcion_descuento,
    descripcion_descuento_en,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
    texto_2_es,
    texto_2_en,
    enlace_descuento,
  } = req.body;

  await descuento.update({
    titulo_descuento,
    titulo_descuento_en,
    descripcion_descuento,
    descripcion_descuento_en,
    tipo_descuento,
    valor_descuento,
    fecha_expiracion,
    medio_descuento,
    codigo_descuento,
    status,
    texto_2_es,
    texto_2_en,
    enlace_descuento,
  });

  return res.status(200).json({
    status: 'success',
    message: 'descuento information has been updated',
    descuento,
  });
});

export const deleteDescuento = catchAsync(async (req, res) => {
  const { descuento } = req;

  await descuento.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The descuento with id: ${descuento.id} has been deleted`,
  });
});
