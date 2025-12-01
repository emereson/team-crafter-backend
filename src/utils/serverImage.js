import axios from 'axios';
import FormData from 'form-data';
import logger from './logger.js';
import { AppError } from './AppError.js';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file.buffer, file.originalname);

  const uploadUrl = `${process.env.SERVER_IMAGE_URL}/image`;

  try {
    const { data } = await axios.post(uploadUrl, formData);

    if (!data.filename) {
      throw new AppError(
        'La respuesta del servicio de archivos no incluyó un nombre de archivo.'
      );
    }
    logger.info('Archivo subido a Laravel con éxito:', data.filename);
    return data.filename;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Error al subir el archivo a Laravel.';
    logger.error('Error en uploadFileToLaravel:', errorMessage, error);
    throw new AppError(errorMessage);
  }
};

export const deleteImage = async (filename) => {
  if (!filename) return;

  const deleteUrl = `${process.env.SERVER_IMAGE_URL}/delete-image/${filename}`;
  logger.info(`Intentando eliminar archivo huérfano de Laravel: ${filename}`);

  try {
    await axios.delete(deleteUrl);
    logger.info(`Archivo huérfano ${filename} eliminado con éxito de Laravel.`);
  } catch (error) {
    console.log(error);

    // Logueamos el error pero no lo relanzamos, ya que el error principal es el de la transacción.
    logger.error(
      `Error al intentar eliminar archivo huérfano ${filename} de Laravel:`,
      error.response?.data || error.message
    );
  }
};
