import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from 'src/auth/registerUser.dto';
import { v2 as cloudinary } from 'cloudinary';
import { UserRoles } from './userRoles.enum';

@Injectable()
export class UsersService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getAllNonAdminUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: Not(UserRoles.ADMIN) } });
  }

  async createNewUser(registerUserDto: RegisterUserDto): Promise<User> {
    return await this.usersRepository.save(registerUserDto);
  }

  async getUserById(userId: number): Promise<User> {
    if (isNaN(userId)) {
      throw new BadRequestException({ error: 'Invalid user ID' });
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ error: 'User not found!' });
    }
    return user;
  }

  async deleteUserById(userId: number): Promise<{ success: boolean }> {
    if (isNaN(userId)) {
      throw new BadRequestException({ error: 'Invalid user ID' });
    }
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ error: 'User not found!' });
    }

    if (user.avatarUrl) {
      const publicId = this.extractPublicIdFromUrl(user.avatarUrl);
      if (publicId) {
        await this.cloudinaryClient.uploader.destroy(publicId);
      }
    }

    await this.usersRepository.delete(userId);
    return { success: true };
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex((part) => part === 'upload');
      if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;

      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      return publicIdWithExt.replace(/\.[^/.]+$/, '');
    } catch {
      return null;
    }
  }

  async updateUserAvatar(userId: number, avatarUrl: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ error: 'User not found!' });
    }

    if (user.avatarUrl) {
      const publicId = this.extractPublicIdFromUrl(user.avatarUrl);
      if (publicId) {
        await this.cloudinaryClient.uploader.destroy(publicId);
      }
    }
    await this.usersRepository.update(userId, { avatarUrl });
  }
}
