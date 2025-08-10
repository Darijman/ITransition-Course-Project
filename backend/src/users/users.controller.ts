import { Controller, Get, Param, UseInterceptors, Delete, UseGuards, Post, UploadedFile, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express } from 'express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Admin } from 'src/auth/auth.decorators';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Admin()
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Get('non-admin')
  async getAllNonAdminUsers(): Promise<User[]> {
    return await this.usersService.getAllNonAdminUsers();
  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  async getUserById(@Param('userId') userId: number): Promise<User> {
    return await this.usersService.getUserById(userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':userId')
  async deleteUserById(@Param('userId') userId: number): Promise<{ success: boolean }> {
    return await this.usersService.deleteUserById(userId);
  }

  @UseGuards(AuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    const userId: number = req.user.id;
    await this.usersService.updateUserAvatar(userId, uploadResult.secure_url);
    return { avatarUrl: uploadResult.secure_url };
  }
}
