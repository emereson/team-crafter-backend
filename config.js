import dotenv from 'dotenv';

dotenv.config();

export const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  PORT,
  FLOW_API_KEY,
  FLOW_SECRET,
  EMAIL,
  PASSWORD_EMAIL,
  FRONTEND_URL,
} = process.env;
