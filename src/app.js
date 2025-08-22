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
import { claseRouter } from './modules/modulesClases/clase/user.routes.js';
import { suscripcionRouter } from './modules/usuario/suscripcion/suscripcion.routes.js';

const app = express();

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

app.use(limiter);

// Rutas
app.use('/api/v1/user', usersRouter);
app.use('/api/v1/clase', claseRouter);
app.use('/api/v1/suscripcion', suscripcionRouter);

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server! 💀`, 404));
});

// Manejo global de errores
app.use(globalErrorHandler);

export { app };
