import { apiClient } from './apiClient';
import type { HealthCheckData } from '../types/api';

/**
 * Calls the backend's /api/health endpoint. Used to verify the
 * frontend -> backend connection is actually working (not just that the
 * frontend compiles), e.g. from the dev connection-test component.
 */
export async function checkHealth(): Promise<HealthCheckData> {
  const { data } = await apiClient.get<HealthCheckData>('/health');
  return data;
}
