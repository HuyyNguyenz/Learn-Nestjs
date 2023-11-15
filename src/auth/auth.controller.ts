import { Controller, Post, Req } from '@nestjs/common/decorators'
import { AuthService } from './auth.service'
import { Request } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  login(@Req() req: Request) {
    return this.authService.login(req.body)
  }
  @Post('signup')
  signup() {
    return this.authService.signup()
  }
}
