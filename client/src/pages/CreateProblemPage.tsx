import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../components/FormField';
import { useCreateProblem } from '../hooks/useCreateProblem';
import { createProblemFormSchema } from '../utils/problemValidation';
import type { CreateProblemFormValues } from '../utils/problemValidation';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function CreateProblemPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProblem();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProblemFormValues>({
    resolver: zodResolver(createProblemFormSchema),
    defaultValues: { difficulty: 'intermediate', locationType: 'remote' },
  });

  const onSubmit = (values: CreateProblemFormValues) => {
    const requiredSkills = (values.skillsInput ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    createMutation.mutate(
      {
        title: values.title,
        description: values.description,
        category: values.category,
        requiredSkills,
        budgetMin: values.budgetMin,
        budgetMax: values.budgetMax,
        deadline: values.deadline || undefined,
        difficulty: values.difficulty,
        locationType: values.locationType,
        location: values.location || undefined,
      },
      {
        onSuccess: (data) => navigate(`/problems/${data.problem._id}`),
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Post a Problem</h1>
      <p className="mt-1 text-slate-600">Describe what you need built and who should apply.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <FormField label="Title" type="text" error={errors.title?.message} {...register('title')} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              errors.description ? 'border-red-400' : 'border-slate-300'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <FormField
          label="Category"
          type="text"
          placeholder="e.g. Web Development"
          error={errors.category?.message}
          {...register('category')}
        />

        <FormField
          label="Required skills (comma-separated)"
          type="text"
          placeholder="react, node, mongodb"
          error={errors.skillsInput?.message}
          {...register('skillsInput')}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Minimum budget ($)"
            type="number"
            error={errors.budgetMin?.message}
            {...register('budgetMin')}
          />
          <FormField
            label="Maximum budget ($)"
            type="number"
            error={errors.budgetMax?.message}
            {...register('budgetMax')}
          />
        </div>

        <FormField
          label="Deadline (optional)"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700">
              Difficulty
            </label>
            <select
              id="difficulty"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize shadow-sm"
              {...register('difficulty')}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label htmlFor="locationType" className="block text-sm font-medium text-slate-700">
              Location type
            </label>
            <select
              id="locationType"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize shadow-sm"
              {...register('locationType')}
            >
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <FormField
          label="Location (if on-site/hybrid)"
          type="text"
          error={errors.location?.message}
          {...register('location')}
        />

        {createMutation.isError && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-700">
            {getErrorMessage(createMutation.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Posting…' : 'Post problem'}
        </button>
      </form>
    </div>
  );
}
