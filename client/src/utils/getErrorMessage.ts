import { isAxiosError } from 'axios';

/** Pulls the backend's `message` field out of a failed request, with sensible fallbacks. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (error.code === 'ERR_NETWORK') {
      return 'Could not reach the server. Check that the backend is running.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
