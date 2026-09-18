export type UserRole = 'developer' | 'business' | 'admin';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/** Matches the SafeUser shape the backend returns (never includes passwordHash). */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  bio?: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  description?: string;
}

export interface DeveloperRegisterPayload {
  role: 'developer';
  name: string;
  email: string;
  password: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  bio?: string;
}

export interface BusinessRegisterPayload {
  role: 'business';
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessType?: string;
  website?: string;
  description?: string;
}

export type RegisterPayload = DeveloperRegisterPayload | BusinessRegisterPayload;

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
