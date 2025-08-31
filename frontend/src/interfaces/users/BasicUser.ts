import { UserRoles } from './UserRoles.enum';

export interface BasicUser {
  id: number;
  name: string;
  email: string;
  role: UserRoles;
  avatarUrl: string | null | undefined;
  hasPassword: boolean;
}
