import { Controller, Get, Param, UseInterceptors, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: number): Promise<User> {
    return await this.usersService.getUserById(userId);
  }

  @Delete(':userId')
  async deleteUserById(@Param('userId') userId: number): Promise<{ success: boolean }> {
    return await this.usersService.deleteUserById(userId);
  }
}
