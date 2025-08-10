import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from 'src/auth/registerUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
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
    await this.usersRepository.delete(userId);
    return { success: true };
  }
}
