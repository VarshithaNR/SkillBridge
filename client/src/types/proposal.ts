import type { ProblemStatus } from './problem';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

/** Safe, populated developer info returned alongside a proposal. */
export interface ProposalDeveloper {
  _id: string;
  name: string;
  role: string;
}

/** Trimmed-down problem info returned alongside a developer's own proposals. */
export interface ProposalProblemSummary {
  _id: string;
  title: string;
  status: ProblemStatus;
  budgetMin: number;
  budgetMax: number;
}

interface BaseProposal {
  _id: string;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration?: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /api/problems/:problemId/proposals (business view). */
export interface ProblemProposal extends BaseProposal {
  developer: ProposalDeveloper;
}

/** Shape returned by GET /api/proposals/me (developer view). */
export interface MyProposal extends BaseProposal {
  problem: ProposalProblemSummary;
}

/** Shape returned by GET /api/proposals/:id — both sides populated. */
export interface Proposal extends BaseProposal {
  problem: ProposalProblemSummary & { postedBy?: string };
  developer: ProposalDeveloper;
}

/** Shape returned right after POST/PATCH — neither side populated. */
export interface ProposalRecord extends BaseProposal {
  problem: string;
  developer: string;
}

export interface SubmitProposalPayload {
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration?: string;
}

export interface ProposalListQuery {
  page?: number;
  limit?: number;
  status?: ProposalStatus;
}
