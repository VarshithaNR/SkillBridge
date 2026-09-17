export type ProblemDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProblemLocationType = 'remote' | 'onsite' | 'hybrid';
export type ProblemStatus =
  | 'open'
  | 'in_review'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/** Safe, populated poster info — never the full User object. */
export interface ProblemPoster {
  _id: string;
  name: string;
  role: string;
}

export interface Problem {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  difficulty: ProblemDifficulty;
  locationType: ProblemLocationType;
  location?: string;
  status: ProblemStatus;
  postedBy: ProblemPoster;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProblemPayload {
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  difficulty: ProblemDifficulty;
  locationType: ProblemLocationType;
  location?: string;
}

export type UpdateProblemPayload = Partial<CreateProblemPayload & { status: ProblemStatus }>;

export interface ProblemListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  skill?: string;
  difficulty?: ProblemDifficulty;
  locationType?: ProblemLocationType;
  status?: ProblemStatus;
  minBudget?: number;
  maxBudget?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProblemListData {
  problems: Problem[];
  pagination: Pagination;
}

export interface ProblemDetailData {
  problem: Problem;
}
