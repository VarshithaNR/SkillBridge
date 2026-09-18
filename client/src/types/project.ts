export type ProjectStatus = 'active' | 'completed' | 'cancelled';

import type { Pagination } from './problem';

export interface ProjectMember {
  _id: string;
  name: string;
  email?: string;
  businessName?: string;
}

export interface ProjectProblemSummary {
  _id: string;
  title: string;
  status: string;
}

export interface Project {
  _id: string;
  problem: ProjectProblemSummary | string;
  business: ProjectMember | string;
  developer: ProjectMember | string;
  title: string;
  description: string;
  totalBudget: number;
  status: ProjectStatus;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
}

export interface ProjectListData {
  projects: Project[];
  pagination: Pagination;
}

export interface ProjectDetailData {
  project: Project;
}

export interface UpdateProjectPayload {
  status: ProjectStatus;
}
