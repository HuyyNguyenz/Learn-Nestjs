import { config } from 'dotenv'

config()
export const ENV_CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  PORT: process.env.PORT as string
} as const
