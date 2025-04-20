import dotenv from "dotenv"
import argv from "minimist"
import z from "zod"
dotenv.config()

const commandArgs = argv(process.argv.slice(2))

export const isEnvProduction = () => {
  return Boolean(commandArgs.production)
}

const envSchema = z.object({
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  PORT: z.string().default("4000"),
  HOST: z.string().min(1),

  PASSWORD_SECRET_KEY: z.string().min(1),
  ACCESS_TOKEN_SECRET_KEY: z.string().min(1),
  REFRESH_TOKEN_SECRET_KEY: z.string().min(1),
  EMAIL_VERIFICATION_SECRET_KEY: z.string().min(1),
  FORGOT_PASSWORD_SECRET_KEY: z.string().min(1),

  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1),
})

const envValidationResult = envSchema.safeParse(process.env)

if (!envValidationResult.success) {
  console.error("Invalid environment variables:", envValidationResult.error.format())
  process.exit(1)
}

export const envConfig = envValidationResult.data
