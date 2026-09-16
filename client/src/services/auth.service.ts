import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  LoginPayload,
  LoginResponseData,
  MeResponseData,
  RefreshResponseData,
  RegisterPayload,
  RegisterResponseData,
} from '../types/auth';

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResponseData> {
  const { data } = await apiClient.post<ApiResponse<RegisterResponseData>>(
    '/auth/register',
    payload
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Registration failed');
  return data.data;
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponseData> {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
  if (!data.success || !data.data) throw new Error(data.message ?? 'Login failed');
  return data.data;
}

export async function refreshRequest(): Promise<RefreshResponseData> {
  const { data } = await apiClient.post<ApiResponse<RefreshResponseData>>('/auth/refresh');
  if (!data.success || !data.data) throw new Error(data.message ?? 'Session refresh failed');
  return data.data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function meRequest(): Promise<MeResponseData> {
  const { data } = await apiClient.get<ApiResponse<MeResponseData>>('/auth/me');
  if (!data.success || !data.data) throw new Error(data.message ?? 'Could not load profile');
  return data.data;
}
