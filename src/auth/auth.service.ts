import { Injectable, Body } from '@nestjs/common/decorators'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthLogin } from './interfaces'

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  login(@Body() body: AuthLogin) {
    return body
  }
  signup() {
    return 'You are signup'
  }
}
