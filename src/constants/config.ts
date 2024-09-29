import dotenv from "dotenv"
dotenv.config()

export const envConfig = {
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  PASSWORD_SECRET_KEY: process.env.PASSWORD_SECRET_KEY,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
}
