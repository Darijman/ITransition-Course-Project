import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';
import { SocialProfile } from './social.types';
import { UserRoles } from 'src/users/userRoles.enum';
import { Providers } from 'src/users/providers.enum';

@Injectable()
export class SocialProfileMapper {
  normalize(provider: Providers, profile: Profile, tokens?: { accessToken?: string; refreshToken?: string }): SocialProfile {
    const email = profile.emails?.[0]?.value ?? undefined;
    const name =
      profile.displayName ??
      (profile.name ? `${(profile.name as any).givenName ?? ''} ${(profile.name as any).familyName ?? ''}`.trim() : (email ?? 'Unknown'));
    const avatar = (profile.photos && profile.photos[0]?.value) ?? undefined;

    return {
      provider,
      providerId: profile.id,
      email,
      name,
      avatarUrl: avatar,
      role: UserRoles.USER,
      tokens: {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      },
    };
  }
}
