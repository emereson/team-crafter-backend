import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix para obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage para imágenes
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/img'),
  filename(req, file, callback) {
    const extension = path.extname(file.originalname);
    const originalName = file.originalname.split(extension)[0];
    const cleanedName = originalName.replace(/\s+/g, '-').toLowerCase();
    const filename = `${cleanedName}-${Date.now()}${extension}`;
    callback(null, filename);
  },
});

// Storage para documentos
const docStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/doc'),
  filename(req, file, callback) {
    const extension = path.extname(file.originalname);
    const originalName = file.originalname.split(extension)[0];
    const cleanedName = originalName.replace(/\s+/g, '-').toLowerCase();
    const filename = `${cleanedName}-${Date.now()}${extension}`;
    callback(null, filename);
  },
});

// Middlewares
export const uploadImage = multer({ storage: imageStorage });
export const uploadDoc = multer({ storage: docStorage });
