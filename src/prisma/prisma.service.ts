import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { ENV_CONFIG } from 'src/constants/config'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: ENV_CONFIG.DATABASE_URL
        }
      }
    })
  }
}
