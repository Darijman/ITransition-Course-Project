import { Providers } from 'src/users/providers.enum';
import { UserRoles } from 'src/users/userRoles.enum';

export interface ReqUser {
  id: number;
  name: string;
  role: UserRoles;
  provider?: Providers;
  providerId?: string;
  email?: string;
  avatarUrl?: string;
  hasPassword: boolean;
}
