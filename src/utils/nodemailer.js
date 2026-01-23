import axios from 'axios';
import { KEY_MAIL } from '../../config.js';
import logger from './logger.js';

const API_URL = 'https://email-server2.team-crafter.com/mail';

export const sendConfirmationEmail = async (
  nombre,
  correo,
  verificationLink,
  plan,
) => {
  await axios
    .post(
      `${API_URL}/confirmacion`,
      { nombre, correo, verificationLink, plan },
      {
        headers: {
          'x-api-key': KEY_MAIL,
        },
      },
    )
    .catch((err) => logger.error(err));
};

export const sendPasswordRecoveryEmail = async (
  nombre,
  correo,
  recoveryToken,
) => {
  await axios
    .post(
      `${API_URL}/recovery`,
      { nombre, correo, recoveryToken },
      {
        headers: {
          'x-api-key': KEY_MAIL,
        },
      },
    )
    .catch((err) => logger.error(err));
};

export const sendRecursoCaducado = async (
  nombre_recurso,
  correo_usuario,
  mensaje,
) => {
  await axios
    .post(
      `${API_URL}/recurso-expirado`,
      { nombre_recurso, correo_usuario, mensaje },
      {
        headers: {
          'x-api-key': KEY_MAIL,
        },
      },
    )
    .catch((err) => logger.error(err));
};
