import 'express';
import { SocialProfileFromDb } from 'src/auth/strategies/social.types';

declare module 'express' {
  export interface Request {
    user: SocialProfileFromDb;
  }
}
