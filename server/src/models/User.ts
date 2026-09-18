import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'developer' | 'business' | 'admin';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Auth + role, plus a small set of role-specific onboarding fields kept
 * directly on User (skills/experience/bio for developers; company info for
 * businesses) rather than in separate DeveloperProfile/BusinessProfile
 * collections. Everything below is optional at the schema level since it
 * only applies to one role — validated per-role in auth.validator.ts.
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  refreshTokens: string[];

  // Developer-only onboarding fields
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  bio?: string;

  // Business-only onboarding fields
  businessName?: string;
  businessType?: string;
  website?: string;
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default — must opt in with .select('+passwordHash')
    },
    role: {
      type: String,
      enum: ['developer', 'business', 'admin'],
      required: [true, 'Role is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false, // hashed tokens; never returned by default either
    },

    skills: {
      type: [String],
      default: undefined,
      set: (skills: string[]) => skills.map((s) => s.trim().toLowerCase()),
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    businessName: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    businessType: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// email already has `unique: true` above, which creates this index — declaring
// it again here would be a duplicate index definition, so we don't repeat it.

export const User = model<IUser>('User', userSchema);
