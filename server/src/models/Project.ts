import { Schema, model, Document, Types } from 'mongoose';

export type ProjectStatus = 'active' | 'completed' | 'cancelled';

/**
 * A Project is created automatically the moment a Business accepts a
 * Proposal (see proposal.service.ts#acceptProposal) — there is no manual
 * "create project" flow. `problem` has a unique index so the database
 * itself prevents a second project from ever being created for the same
 * problem, even if the accept endpoint is somehow called twice concurrently.
 */
export interface IProject extends Document {
  _id: Types.ObjectId;
  problem: Types.ObjectId;
  business: Types.ObjectId;
  developer: Types.ObjectId;
  title: string;
  description: string;
  totalBudget: number;
  status: ProjectStatus;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      unique: true, // one project per problem — DB-level duplicate guard
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    developer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    startedAt: {
      type: Date,
      default: () => new Date(),
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Common access pattern: "my projects" for a business or developer, newest first.
projectSchema.index({ business: 1, createdAt: -1 });
projectSchema.index({ developer: 1, createdAt: -1 });

export const Project = model<IProject>('Project', projectSchema);
