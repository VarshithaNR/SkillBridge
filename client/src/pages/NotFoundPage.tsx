import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">This page doesn&apos;t exist.</p>
      <Link to="/" className="mt-4 font-medium text-slate-900 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
