import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dto'
import * as argon2 from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { USER_MESSAGES } from 'src/constant/messages'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}
  signAccessToken(userId: number, expiresIn: number | string) {
    return this.jwt.signAsync({ id: userId }, { secret: this.config.get('ACCESS_SECRET_KEY'), expiresIn })
  }
  signRefreshToken(userId: number, expiresIn: number | string) {
    return this.jwt.signAsync({ id: userId }, { secret: this.config.get('REFRESH_SECRET_KEY'), expiresIn })
  }
  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)
    }
    const verifyPassword = await argon2.verify(user.password, dto.password)
    if (!verifyPassword) {
      throw new NotFoundException(USER_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)
    }
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user.id, '15m'),
      this.signRefreshToken(user.id, '7d')
    ])
    return {
      message: USER_MESSAGES.LOGIN_SUCCESS,
      result: { access_token, refresh_token }
    }
  }
  async signup(dto: AuthDto) {
    const hashPassword = await argon2.hash(dto.password)
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashPassword
        },
        select: {
          id: true,
          email: true,
          created_at: true,
          updated_at: true,
          first_name: true,
          last_name: true
        }
      })
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(user.id, '15m'),
        this.signRefreshToken(user.id, '7d')
      ])
      return {
        message: USER_MESSAGES.SIGN_UP_SUCCESS,
        result: { access_token, refresh_token }
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(USER_MESSAGES.EMAIL_IS_ALREADY_EXISTS)
        }
      }
      throw error
    }
  }
}
