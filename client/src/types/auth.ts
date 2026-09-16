export type UserRole = 'developer' | 'business' | 'admin';

/** Matches the SafeUser shape the backend returns (never includes passwordHash). */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>; // admin accounts aren't self-registered
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}

export interface RegisterResponseData {
  user: User;
}

export interface RefreshResponseData {
  accessToken: string;
}

export interface MeResponseData {
  user: User;
}
