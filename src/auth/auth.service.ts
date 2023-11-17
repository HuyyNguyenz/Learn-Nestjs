import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dtos'
import * as argon2 from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { USER_MESSAGES } from 'src/constants/messages'

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
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
    delete user.password
    return user
  }
  async signup(dto: AuthDto) {
    try {
      const hashPassword = await argon2.hash(dto.password)
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
      return user
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
