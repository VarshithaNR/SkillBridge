import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';

export interface UserStats {
  totalUsers: number;
  developers: number;
  businesses: number;
  admins: number;
}

export async function getUserStats(): Promise<UserStats> {
  const { data } = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load stats');
  return data.data;
}
