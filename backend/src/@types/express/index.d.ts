import 'express';
import { UserRoles } from 'src/users/userRoles.enum';

declare module 'express' {
  export interface Request {
    user: {
      id: number;
      name: string;
      role: UserRoles;
    };
  }
}
