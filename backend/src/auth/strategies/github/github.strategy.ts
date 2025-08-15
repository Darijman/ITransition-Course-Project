import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GithubStrategyBase, Profile, StrategyOptionsWithRequest } from 'passport-github2';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocialProfileMapper } from '../social-profile.mapper';
import { SocialProfile } from '../social.types';
import { Providers } from 'src/users/providers.enum';

@Injectable()
export class GithubStrategy extends PassportStrategy(GithubStrategyBase, Providers.GITHUB) {
  constructor(
    private readonly configService: ConfigService,
    private readonly mapper: SocialProfileMapper,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile): Promise<SocialProfile> {
    return this.mapper.normalize(Providers.GITHUB, profile, { accessToken, refreshToken });
  }
}
