import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Delete,
  UseGuards,
  Post,
  UploadedFile,
  Req,
  ForbiddenException,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express } from 'express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Admin, Public } from 'src/auth/auth.decorators';
import { UserRoles } from './userRoles.enum';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { UpdateUserPasswordDto } from './updateUserPassword.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Get('non-admin')
  async getAllNonAdminUsers(): Promise<User[]> {
    return await this.usersService.getAllNonAdminUsers();
  }

  // @Public()
  @UseGuards(AuthGuard)
  @Get(':userId')
  async getUserById(@Param('userId', new CustomParseIntPipe('User ID')) userId: number): Promise<User> {
    return await this.usersService.getUserById(userId);
  }

  @Public()
  // @UseGuards(AuthGuard)
  @Delete(':userId')
  async deleteUserById(@Param('userId', new CustomParseIntPipe('User ID')) userId: number): Promise<{ success: boolean }> {
    return await this.usersService.deleteUserById(userId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Post(':userId/upload-avatar')
  async uploadAvatar(
    @Param('userId', new CustomParseIntPipe('User ID')) userId: number,
    @UploadedFile() avatar: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (req.user.role !== UserRoles.ADMIN && req.user.id !== userId) {
      throw new ForbiddenException({ error: 'You can only update your own avatar!' });
    }

    let uploadResult: { secure_url: string; public_id: string } | null = null;

    try {
      uploadResult = await this.cloudinaryService.uploadImage(avatar, 'avatars');
      await this.usersService.updateUserAvatar(userId, uploadResult.secure_url);
      return { avatarUrl: uploadResult.secure_url };
    } catch (error) {
      if (uploadResult?.public_id) {
        try {
          await this.cloudinaryService.deleteImage(uploadResult.public_id);
        } catch (cleanupError) {
          console.error('Failed to clean up Cloudinary image:', cleanupError);
        }
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/password')
  async updateUserPassword(@Req() req: Request, @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
    return await this.usersService.updateUserPassword(req.user.id, updateUserPasswordDto);
  }
}
