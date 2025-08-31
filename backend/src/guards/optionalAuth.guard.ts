import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/auth.constants';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { UserRoles } from 'src/users/userRoles.enum';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ id: number; name: string; role: UserRoles }>(token, {
        secret: jwtConstants.secret,
      });
      const user = await this.usersService.getUserById(payload.id);
      request.user = { id: user.id, name: user.name, email: user.email, role: user.role, hasPassword: !!user.password };
    } catch {
      return true;
    }

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
