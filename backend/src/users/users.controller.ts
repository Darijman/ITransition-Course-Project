import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Delete,
  UseGuards,
  UploadedFile,
  Req,
  ForbiddenException,
  Body,
  BadRequestException,
  Put,
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
import { UpdateUserDto } from './updateUser.dto';

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
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(new BadRequestException({ error: 'Only .png, .jpg, .jpeg files are allowed!' }), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    }),
  )
  @Put(':userId')
  async updateUser(
    @Param('userId', new CustomParseIntPipe('User ID')) userId: number,
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ) {
    if (req.user.role !== UserRoles.ADMIN && req.user.id !== userId) {
      throw new ForbiddenException({ error: 'You can only update your own profile!' });
    }

    const result = await this.usersService.updateUser(userId, updateUserDto, avatarFile);
    return result;
  }
}
