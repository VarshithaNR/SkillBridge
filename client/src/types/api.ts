/**
 * Matches the backend's response shape exactly (see server/src/middleware/errorHandler.ts
 * and the ApiError pattern). Every service function should return data typed
 * against these, so a mismatch between what the backend sends and what the
 * frontend expects shows up as a TypeScript error, not a runtime bug.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthCheckData {
  success: boolean;
  message: string;
}
