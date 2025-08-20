import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from 'src/auth/registerUser.dto';
import { UserRoles } from './userRoles.enum';
import { extractPublicIdFromUrl } from 'src/common/cloudinary/cloudinary.helpers';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UpdateUserPasswordDto } from './updateUserPassword.dto';
import { UpdateUserDto } from './updateUser.dto';
import { Express } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getAllNonAdminUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: Not(UserRoles.ADMIN) } });
  }

  async createNewUser(registerUserDto: RegisterUserDto): Promise<User> {
    const user = this.usersRepository.create(registerUserDto);
    return await this.usersRepository.save(user);
  }

  async getUserById(userId: number): Promise<User> {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException({ error: 'Invalid user ID!' });
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ error: 'User not found!' });
    }
    return user;
  }

  async deleteUserById(userId: number): Promise<{ success: boolean }> {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException({ error: 'Invalid user ID!' });
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ error: 'User not found!' });
    }

    if (user.avatarUrl) {
      const publicId = extractPublicIdFromUrl(user.avatarUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    await this.usersRepository.delete(userId);
    return { success: true };
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto, avatarFile?: Express.Multer.File): Promise<{ success: boolean }> {
    console.log(`updateUserDto`, updateUserDto);

    if (!userId || isNaN(userId)) {
      throw new BadRequestException({ error: 'Invalid user ID!' });
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ error: 'User not found!' });
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.oldPassword || updateUserDto.newPassword) {
      if (!updateUserDto.oldPassword || !updateUserDto.newPassword) {
        throw new BadRequestException({ error: 'Invalid credentials' });
      }

      const isValid = await user.validatePassword(updateUserDto.oldPassword);
      if (!isValid) {
        throw new BadRequestException({ error: 'Invalid credentials' });
      }

      user.password = updateUserDto.newPassword;
      user.passwordUpdatedAt = new Date();
    }

    if (avatarFile) {
      if (user.avatarUrl) {
        const publicId = extractPublicIdFromUrl(user.avatarUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
      const uploaded = await this.cloudinaryService.uploadImage(avatarFile, 'avatars');
      user.avatarUrl = uploaded.secure_url;
    } else if (updateUserDto.avatarUrl === '' || updateUserDto.avatarUrl === null) {
      if (user.avatarUrl) {
        const publicId = extractPublicIdFromUrl(user.avatarUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
      user.avatarUrl = undefined;
    }

    await this.usersRepository.save(user);
    return { success: true };
  }
}
