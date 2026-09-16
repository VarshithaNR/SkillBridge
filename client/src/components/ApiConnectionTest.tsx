import { useHealthCheck } from '../hooks/useHealthCheck';

/**
 * Small visible proof that Frontend -> Backend -> Response works end-to-end.
 * Not a real feature — just a development aid while wiring up the API layer.
 * Safe to delete once real API-backed features exist and make this redundant.
 */
export default function ApiConnectionTest() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealthCheck();

  return (
    <div className="mt-6 w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">API Connection Test</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
        >
          {isFetching ? 'Checking…' : 'Retry'}
        </button>
      </div>

      {isLoading && <p className="mt-2 text-sm text-slate-500">Checking backend connection…</p>}

      {isError && (
        <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
          <p className="font-medium">Could not reach the backend.</p>
          <p className="mt-1 text-xs text-red-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <p className="mt-1 text-xs text-red-600">
            Check that the server is running on port 5001 and VITE_API_URL is set correctly.
          </p>
        </div>
      )}

      {data && (
        <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-800">
          <p className="font-medium">✅ Connected</p>
          <p className="mt-1 text-xs text-green-700">{data.message}</p>
        </div>
      )}
    </div>
  );
}
