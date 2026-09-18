import { User } from '../models/User';

export interface UserStats {
  totalUsers: number;
  developers: number;
  businesses: number;
  admins: number;
}

/** Cheap role-count aggregation, used to power the admin dashboard. */
export async function getUserStats(): Promise<UserStats> {
  const [totalUsers, developers, businesses, admins] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'developer' }),
    User.countDocuments({ role: 'business' }),
    User.countDocuments({ role: 'admin' }),
  ]);

  return { totalUsers, developers, businesses, admins };
}
