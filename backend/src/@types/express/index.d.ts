import 'express';

import { ReqUser } from 'src/interfaces/ReqUser';

declare module 'express' {
  export interface Request {
    user: ReqUser;
  }
}
