import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './registerUser.dto';
import { LoginUserDto } from './loginUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registerNewUser(@Body() registerUserDto: RegisterUserDto): Promise<{ access_token: string }> {
    const createdUser = await this.usersService.createNewUser(registerUserDto);
    const payload = { id: createdUser.id, name: createdUser.name, role: createdUser.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async logIn(@Body() loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException({ error: 'Incorrect login or password!' });
    }

    const isPasswordCorrect = await user.validatePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException({ error: 'Incorrect login or password!' });
    }

    const payload = { id: user.id, name: user.name, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
