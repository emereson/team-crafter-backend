import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Elimina un archivo de manera segura
 * @param {string} filename - Nombre del archivo a eliminar
 * @param {string} folder - Carpeta donde se encuentra ('img' o 'doc')
 * @returns {Promise<boolean>} - true si se eliminó, false si no
 */
export const deleteFile = async (filename, folder = 'img') => {
  if (!filename) return false;

  const filePath = path.join(__dirname, `../uploads/${folder}`, filename);

  try {
    await fs.access(filePath); // Verificar si existe
    await fs.unlink(filePath); // Eliminar
    return true;
  } catch (error) {
    return false;
  }
};

// Versión específica para imágenes
export const deleteImage = (filename) => deleteFile(filename, 'img');

// Versión específica para documentos
export const deleteDocument = (filename) => deleteFile(filename, 'doc');
