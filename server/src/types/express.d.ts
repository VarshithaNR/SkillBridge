import { UserRole } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

// Required to make this a module (not a script) so `declare global` merges correctly.
export {};
