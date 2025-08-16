import { Body, Controller, Get, HttpCode, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './registerUser.dto';
import { Public } from './auth.decorators';
import { LoginUserDto } from './loginUser.dto';
import { Response, Request } from 'express';
import { UserDuplicateEmailFilter } from 'src/common/filters/user-duplicate-email.filter';
import { GoogleAuthGuard } from './strategies/google/google-auth.guard';
import { UsersService } from 'src/users/users.service';
import { GithubAuthGuard } from './strategies/github/github-auth.guard';

@UseFilters(UserDuplicateEmailFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @HttpCode(201)
  @Post('register')
  async registerNewUser(@Body() registerUserDto: RegisterUserDto, @Res() res: Response) {
    const { access_token } = await this.authService.registerNewUser(registerUserDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });
    return res.send({ success: true });
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async logInUser(@Body() logInUserDto: LoginUserDto, @Res() res: Response) {
    const { access_token } = await this.authService.logIn(logInUserDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });

    return res.send({ success: true });
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = await this.usersService.getUserById(req.user.id);
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  @Public()
  @HttpCode(200)
  @Post('logout')
  async logOutUser(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    return res.send({ success: true });
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    console.log(`сработал /auth/google`);
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { access_token } = await this.authService.socialLogin(req.user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    return res.redirect('http://localhost:3000');
  }

  @Public()
  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubAuth() {
    console.log(`сработал /auth/github`);
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { access_token } = await this.authService.socialLogin(req.user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });
    return res.redirect('http://localhost:3000');
  }
}
