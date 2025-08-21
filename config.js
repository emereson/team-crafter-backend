import dotenv from "dotenv";

dotenv.config();

export const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, PORT } = process.env;
