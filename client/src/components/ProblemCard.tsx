import { Link } from 'react-router-dom';
import type { Problem } from '../types/problem';

const difficultyColors: Record<Problem['difficulty'], string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-amber-100 text-amber-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      to={`/problems/${problem._id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">{problem.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyColors[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{problem.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {problem.requiredSkills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          ${problem.budgetMin.toLocaleString()} – ${problem.budgetMax.toLocaleString()}
        </span>
        <span className="capitalize">{problem.locationType}</span>
        <span>{problem.category}</span>
      </div>
    </Link>
  );
}
