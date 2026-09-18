import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from './FormField';
import { useSubmitProposal } from '../hooks/useSubmitProposal';
import { submitProposalFormSchema } from '../utils/proposalValidation';
import type { SubmitProposalFormValues } from '../utils/proposalValidation';
import { getErrorMessage } from '../utils/getErrorMessage';

interface ProposalFormProps {
  problemId: string;
  onSubmitted?: () => void;
}

export default function ProposalForm({ problemId, onSubmitted }: ProposalFormProps) {
  const submitMutation = useSubmitProposal(problemId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmitProposalFormValues>({
    resolver: zodResolver(submitProposalFormSchema),
  });

  const onSubmit = (values: SubmitProposalFormValues) => {
    submitMutation.mutate(
      {
        coverLetter: values.coverLetter,
        proposedBudget: values.proposedBudget,
        estimatedDuration: values.estimatedDuration || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onSubmitted?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-slate-700">
          Cover letter
        </label>
        <textarea
          id="coverLetter"
          rows={5}
          placeholder="Explain why you're a good fit and how you'd approach this problem…"
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
            errors.coverLetter ? 'border-red-400' : 'border-slate-300'
          }`}
          {...register('coverLetter')}
        />
        {errors.coverLetter && (
          <p className="mt-1 text-xs text-red-600">{errors.coverLetter.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Proposed budget ($)"
          type="number"
          error={errors.proposedBudget?.message}
          {...register('proposedBudget')}
        />
        <FormField
          label="Estimated duration (optional)"
          type="text"
          placeholder="e.g. 2 weeks"
          error={errors.estimatedDuration?.message}
          {...register('estimatedDuration')}
        />
      </div>

      {submitMutation.isError && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">
          {getErrorMessage(submitMutation.error)}
        </p>
      )}

      {submitMutation.isSuccess && (
        <p className="rounded bg-green-50 p-2 text-sm text-green-700">
          Proposal submitted successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={submitMutation.isPending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitMutation.isPending ? 'Submitting…' : 'Submit Proposal'}
      </button>
    </form>
  );
}
