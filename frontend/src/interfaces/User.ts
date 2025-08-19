import { Providers } from './Providers.enum';
import { UserRoles } from './UserRoles.enum';

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRoles;
  passwordUpdatedAt: string;

  providerId: string | null;
  provider?: Providers;

  createdAt: string;
  updatedAt: string;
}