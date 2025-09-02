import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix para obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para generar nombres limpios
const generateFileName = (file) => {
  const extension = path.extname(file.originalname);
  const originalName = file.originalname.split(extension)[0];
  const cleanedName = originalName.replace(/\s+/g, '-').toLowerCase();
  return `${cleanedName}-${Date.now()}${extension}`;
};

// Storage para imágenes
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/img'),
  filename(req, file, callback) {
    callback(null, generateFileName(file));
  },
});

// Storage para documentos
const docStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/doc'),
  filename(req, file, callback) {
    callback(null, generateFileName(file));
  },
});

// Middlewares con límites
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

export const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});
