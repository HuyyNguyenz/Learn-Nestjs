import { Injectable } from '@nestjs/common'

@Injectable({})
export class AuthService {
  login() {
    return 'You are login'
  }
  signup() {
    return 'You are signup'
  }
}
