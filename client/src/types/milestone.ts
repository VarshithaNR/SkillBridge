export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface Milestone {
  _id: string;
  project: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestonePayload {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  order?: number;
}

export interface UpdateMilestonePayload {
  title?: string;
  description?: string;
  amount?: number;
  dueDate?: string;
  order?: number;
  status?: MilestoneStatus;
}
