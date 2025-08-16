import { UserRoles } from './UserRoles.enum';

export interface BasicUser {
  id: number;
  name: string;
  role: UserRoles;
  avatarUrl: string;
}