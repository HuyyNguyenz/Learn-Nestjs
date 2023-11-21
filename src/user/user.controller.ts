import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common'
import { JwtGuard } from '../auth/guard'
import { GetUser } from '../auth/decorator'
import { User } from '@prisma/client'
import { UserService } from './user.service'
import { EditUserDto } from './dto'

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user
  }

  @Patch()
  editUser(@GetUser('id') id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto)
  }
}
