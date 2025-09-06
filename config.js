import dotenv from 'dotenv';

dotenv.config();

export const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  PORT,
  FLOW_API_KEY,
  FLOW_SECRET,
  EMAIL,
  PASSWORD_EMAIL,
  FRONTEND_URL,
  BACKEND_URL,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
} = process.env;
