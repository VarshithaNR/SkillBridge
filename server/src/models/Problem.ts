import { Schema, model, Document, Types } from 'mongoose';

export type ProblemDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProblemLocationType = 'remote' | 'onsite' | 'hybrid';
export type ProblemStatus =
  | 'open'
  | 'in_review'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/**
 * `postedBy` references User directly (not a BusinessProfile) since
 * BusinessProfile doesn't exist yet as of this phase — it's a documented
 * future collection. When it's built, this can be extended/populated
 * without changing the field's meaning (a business's User account posted it).
 */
export interface IProblem extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budgetMin: number;
  budgetMax: number;
  deadline?: Date;
  difficulty: ProblemDifficulty;
  locationType: ProblemLocationType;
  location?: string; // city/region, only meaningful for onsite/hybrid
  status: ProblemStatus;
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
      set: (skills: string[]) => skills.map((s) => s.trim().toLowerCase()),
    },
    budgetMin: {
      type: Number,
      required: [true, 'Minimum budget is required'],
      min: 0,
    },
    budgetMax: {
      type: Number,
      required: [true, 'Maximum budget is required'],
      min: 0,
      validate: {
        validator: function (this: IProblem, value: number) {
          return value >= this.budgetMin;
        },
        message: 'budgetMax must be greater than or equal to budgetMin',
      },
    },
    deadline: {
      type: Date,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty is required'],
      index: true,
    },
    locationType: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote',
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Powers the `search` query param (matches against title/description).
problemSchema.index({ title: 'text', description: 'text' });

// Common compound filter: browsing open problems in a category, newest first.
problemSchema.index({ status: 1, category: 1, createdAt: -1 });

export const Problem = model<IProblem>('Problem', problemSchema);
