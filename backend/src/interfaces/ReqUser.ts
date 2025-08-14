import { UserRoles } from 'src/users/userRoles.enum';

export interface ReqUser {
  id: number;
  name: string;
  role: UserRoles;
}
