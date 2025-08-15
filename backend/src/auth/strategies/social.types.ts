import { UserRoles } from 'src/users/userRoles.enum';
import { Providers } from 'src/users/providers.enum';

export interface SocialProfile {
  provider: Providers;
  providerId: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  role: UserRoles;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface SocialProfileFromDb extends SocialProfile {
  id: number;
}
