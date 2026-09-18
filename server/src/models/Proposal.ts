import { Schema, model, Document, Types } from 'mongoose';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

/**
 * `developer` references User directly (not a DeveloperProfile) since
 * DeveloperProfile doesn't exist yet as of this phase — same reasoning as
 * Problem.postedBy. When DeveloperProfile is built, this can be extended
 * without changing the field's meaning (a developer's User account
 * submitted it).
 */
export interface IProposal extends Document {
  _id: Types.ObjectId;
  problem: Types.ObjectId;
  developer: Types.ObjectId;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration?: string;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    developer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      maxlength: 3000,
    },
    proposedBudget: {
      type: Number,
      required: [true, 'Proposed budget is required'],
      min: 0,
    },
    estimatedDuration: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// One proposal per developer per problem — enforced at the database layer
// (not just checked in application code), so it holds even under concurrent
// requests, per docs/database/schema.md.
proposalSchema.index({ problem: 1, developer: 1 }, { unique: true });

export const Proposal = model<IProposal>('Proposal', proposalSchema);
