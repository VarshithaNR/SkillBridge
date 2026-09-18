import { useState } from 'react';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}

const SUGGESTED_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'Python',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Vue',
  'Django',
  'GraphQL',
  'Next.js',
];

/** Chip-based multi-select for a developer's skills, with a free-text "add custom" fallback. */
export function SkillsInput({ value, onChange, error }: SkillsInputProps) {
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    const normalized = skill.trim();
    if (!normalized) return;
    const exists = value.some((s) => s.toLowerCase() === normalized.toLowerCase());
    onChange(exists ? value.filter((s) => s.toLowerCase() !== normalized.toLowerCase()) : [...value, normalized]);
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      toggleSkill(customSkill);
      setCustomSkill('');
    }
  };

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">Skills</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTED_SKILLS.map((skill) => {
          const selected = value.some((s) => s.toLowerCase() === skill.toLowerCase());
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomSkill();
            }
          }}
          placeholder="Add another skill…"
          className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="button"
          onClick={addCustomSkill}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
            >
              {skill}
              <button
                type="button"
                onClick={() => toggleSkill(skill)}
                aria-label={`Remove ${skill}`}
                className="text-indigo-400 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
