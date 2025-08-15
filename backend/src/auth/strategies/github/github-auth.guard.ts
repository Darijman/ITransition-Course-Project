import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Providers } from 'src/users/providers.enum';

@Injectable()
export class GithubAuthGuard extends AuthGuard(Providers.GITHUB) {}
