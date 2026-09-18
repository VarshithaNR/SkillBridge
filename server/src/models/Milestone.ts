import { Schema, model, Document, Types } from 'mongoose';

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface IMilestone extends Document {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  dueDate?: Date;
  status: MilestoneStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
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
      trim: true,
      maxlength: 3000,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Powers "milestones for this project, in display order".
milestoneSchema.index({ project: 1, order: 1 });

export const Milestone = model<IMilestone>('Milestone', milestoneSchema);
