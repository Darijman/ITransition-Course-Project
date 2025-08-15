import { UserRoles } from './UserRoles';

export interface BasicUser {
  id: number;
  name: string;
  role: UserRoles;
  avatarUrl: string;
}