import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { IS_PUBLIC_KEY, IS_ADMIN_KEY } from './auth.decorators';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { UserRoles } from 'src/users/userRoles.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdminRequired = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [context.getHandler(), context.getClass()]);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException({ error: 'Session expired. Please log in again.' });
    }

    let payload: { id: number; name: string; role: UserRoles };
    try {
      payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret });
    } catch {
      throw new UnauthorizedException({ error: 'Session expired. Please log in again.' });
    }

    const user = await this.usersService.getUserById(payload.id);
    if (isAdminRequired && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException({ error: 'You do not have permission!' });
    }

    request.user = { id: user.id, name: user.name, role: user.role };
    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') return token;
    }
    return request.cookies?.access_token;
  }
}
