import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ENV_CONFIG } from './constants/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(ENV_CONFIG.PORT)
  console.log(`Server is running at port:${ENV_CONFIG.PORT}`)
}
bootstrap()
