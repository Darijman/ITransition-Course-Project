import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Providers } from 'src/users/providers.enum';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(Providers.GOOGLE) {}
