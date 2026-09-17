import { Link } from 'react-router-dom';
import ApiConnectionTest from '../components/ApiConnectionTest';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">SkillBridge</h1>
      <p className="mt-3 max-w-md text-slate-600">
        Turn real-world problems into real opportunities.
      </p>

      <Link
        to="/problems"
        className="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Browse Problems
      </Link>

      <ApiConnectionTest />
    </div>
  );
}
