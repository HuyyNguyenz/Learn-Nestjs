import { config } from 'dotenv'

config({
  path: '.env.development'
})
export const ENV_CONFIG = {
  PORT: process.env.PORT as string
} as const
