import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'developer' | 'business' | 'admin';

/**
 * Auth + role only. Role-specific data (headline, skills, portfolio, company
 * info, etc.) lives in DeveloperProfile / BusinessProfile, built in a later
 * phase — this keeps User small and avoids unused fields per role.
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
  },
  { timestamps: true }
);

// email already has `unique: true` above, which creates this index — declaring
// it again here would be a duplicate index definition, so we don't repeat it.

export const User = model<IUser>('User', userSchema);
