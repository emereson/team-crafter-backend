import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

import { AppError } from './utils/AppError.js';
import { globalErrorHandler } from './utils/errors.js';
import { usersRouter } from './modules/usuario/user/user.routes.js';
import { suscripcionRouter } from './modules/usuario/suscripcion/suscripcion.routes.js';
import { claseRouter } from './modules/modulesClases/clase/clase.routes.js';
import { comentarioClaseRouter } from './modules/modulesClases/comentarioClase/comentarioClase.routes.js';
import { recursoRouter } from './modules/recurso/recurso.routes.js';
import { descuentoRouter } from './modules/descuento/descuento.routes.js';
import { adminRouter } from './modules/admins/admin.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { respuestaComentarioClaseRouter } from './modules/modulesClases/respuestaComentarioClase/respuestaComentarioClase.routes.js';
import { likeClaseRouter } from './modules/usuario/likesClases/likeClase.routes.js';
import { likeComentarioClaseRouter } from './modules/usuario/likeComentarioClase/likeComentarioClase.routes.js';
import { favoritoRouter } from './modules/usuario/favoritos/favorito.routes.js';
import { claseAdminRouter } from './modules/modulesClases/clase/claseAdmin.routes.js';
import { recursoAdminRouter } from './modules/recurso/recursoAdmin.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', 1);

const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour.',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers nativos de Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(xss());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(hpp());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1', limiter);
app.use('/api/v1/user', usersRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/suscripcion', suscripcionRouter);
app.use('/api/v1/clase', claseRouter);
app.use('/api/v1/clase-admin', claseAdminRouter);

app.use('/api/v1/comentario-clase', comentarioClaseRouter);
app.use('/api/v1/respuesta-comentario-clase', respuestaComentarioClaseRouter);

app.use('/api/v1/recurso', recursoRouter);
app.use('/api/v1/recurso-admin', recursoAdminRouter);

app.use('/api/v1/descuento', descuentoRouter);

app.use('/api/v1/like-clase', likeClaseRouter);
app.use('/api/v1/like-comentario-clase', likeComentarioClaseRouter);
app.use('/api/v1/favorito', favoritoRouter);

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server! 💀`, 404));
});

// Manejo global de errores
app.use(globalErrorHandler);

export { app };
