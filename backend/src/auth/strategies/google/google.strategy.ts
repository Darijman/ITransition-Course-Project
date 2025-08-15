import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategyBase, Profile, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocialProfile } from '../social.types';
import { SocialProfileMapper } from '../social-profile.mapper';
import { Providers } from 'src/users/providers.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyBase, Providers.GOOGLE) {
  constructor(
    private readonly configService: ConfigService,
    private readonly mapper: SocialProfileMapper,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile): Promise<SocialProfile> {
    return this.mapper.normalize(Providers.GOOGLE, profile, { accessToken, refreshToken });
  }
}
