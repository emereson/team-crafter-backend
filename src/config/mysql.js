import { Sequelize } from 'sequelize';
import {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
} from '../../config.js';

const db = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT,
  dialect: 'postgres',
  host: DB_HOST,
  logging: false,
});

export { db };
