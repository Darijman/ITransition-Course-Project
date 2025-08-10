import { Body, Controller, Get, HttpCode, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './registerUser.dto';
import { Public } from './auth.decorators';
import { LoginUserDto } from './loginUser.dto';
import { Response, Request } from 'express';
import { UserDuplicateEmailFilter } from 'src/filters/user-duplicate-email.filter';

@UseFilters(UserDuplicateEmailFilter)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    return req.user;
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
}
