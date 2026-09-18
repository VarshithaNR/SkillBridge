import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../components/FormField';
import { FormTextarea } from '../components/FormTextarea';
import { SkillsInput } from '../components/SkillsInput';
import { RoleSelectionCard } from '../components/RoleSelectionCard';
import { useRegister } from '../hooks/useRegister';
import {
  developerRegisterFormSchema,
  businessRegisterFormSchema,
} from '../utils/authValidation';
import type {
  DeveloperRegisterFormValues,
  BusinessRegisterFormValues,
} from '../utils/authValidation';
import { getErrorMessage } from '../utils/getErrorMessage';

type SelectableRole = 'developer' | 'business';

const DeveloperIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8 9-4 3 4 3m8-6 4 3-4 3m-6 3 4-12" />
  </svg>
);

const BusinessIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"
    />
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [selectedRole, setSelectedRole] = useState<SelectableRole | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const developerForm = useForm<DeveloperRegisterFormValues>({
    resolver: zodResolver(developerRegisterFormSchema),
    defaultValues: { role: 'developer', skills: [], experienceLevel: 'beginner' },
  });

  const businessForm = useForm<BusinessRegisterFormValues>({
    resolver: zodResolver(businessRegisterFormSchema),
    defaultValues: { role: 'business' },
  });

  const skills = developerForm.watch('skills');

  const onSubmitDeveloper = (values: DeveloperRegisterFormValues) => {
    registerMutation.mutate(
      {
        role: 'developer',
        name: values.name,
        email: values.email,
        password: values.password,
        skills: values.skills,
        experienceLevel: values.experienceLevel,
        bio: values.bio,
      },
      { onSuccess: () => setSubmittedEmail(values.email) }
    );
  };

  const onSubmitBusiness = (values: BusinessRegisterFormValues) => {
    registerMutation.mutate(
      {
        role: 'business',
        name: values.name,
        email: values.email,
        password: values.password,
        businessName: values.businessName,
        businessType: values.businessType,
        website: values.website || undefined,
        description: values.description,
      },
      { onSuccess: () => setSubmittedEmail(values.email) }
    );
  };

  if (submittedEmail) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm rounded-xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
          <p className="font-medium text-green-800">Account created for {submittedEmail}</p>
          <p className="mt-2 text-sm text-green-700">You can now sign in.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  // Step 1 — role selection. Admin is intentionally never offered here.
  if (!selectedRole) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Create your SkillBridge account</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Join SkillBridge and turn real-world problems into real opportunities.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RoleSelectionCard
              icon={DeveloperIcon}
              title="Developer"
              description="Build projects, grow your portfolio, and work on real-world problems."
              selected={false}
              onSelect={() => setSelectedRole('developer')}
            />
            <RoleSelectionCard
              icon={BusinessIcon}
              title="Business"
              description="Post your software problems and find developers who can build them."
              selected={false}
              onSelect={() => setSelectedRole('business')}
            />
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2 — role-specific form.
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          ← Change account type
        </button>

        {selectedRole === 'developer' ? (
          <>
            <h1 className="text-xl font-semibold text-slate-900">Create Developer Account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Show off your skills and start proposing on real problems.
            </p>

            <form
              onSubmit={developerForm.handleSubmit(onSubmitDeveloper)}
              className="mt-6 space-y-4"
              noValidate
            >
              <FormField
                label="Full name"
                type="text"
                autoComplete="name"
                error={developerForm.formState.errors.name?.message}
                {...developerForm.register('name')}
              />
              <FormField
                label="Email"
                type="email"
                autoComplete="email"
                error={developerForm.formState.errors.email?.message}
                {...developerForm.register('email')}
              />
              <FormField
                label="Password"
                type="password"
                autoComplete="new-password"
                error={developerForm.formState.errors.password?.message}
                {...developerForm.register('password')}
              />
              <FormField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                error={developerForm.formState.errors.confirmPassword?.message}
                {...developerForm.register('confirmPassword')}
              />

              <SkillsInput
                value={skills ?? []}
                onChange={(next) =>
                  developerForm.setValue('skills', next, { shouldValidate: true })
                }
                error={developerForm.formState.errors.skills?.message as string | undefined}
              />

              <div>
                <span className="block text-sm font-medium text-slate-700">Experience Level</span>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        developerForm.setValue('experienceLevel', level, { shouldValidate: true })
                      }
                      className={`rounded-md border px-2 py-2 text-xs font-medium capitalize ${
                        developerForm.watch('experienceLevel') === level
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <FormTextarea
                label="Bio"
                placeholder="A couple of sentences about what you build and enjoy working on…"
                error={developerForm.formState.errors.bio?.message}
                {...developerForm.register('bio')}
              />

              {registerMutation.isError && (
                <p className="rounded bg-red-50 p-2 text-sm text-red-700">
                  {getErrorMessage(registerMutation.error)}
                </p>
              )}

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {registerMutation.isPending ? 'Creating account…' : 'Create Developer Account'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900">Create Business Account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Post problems and connect with developers who can solve them.
            </p>

            <form
              onSubmit={businessForm.handleSubmit(onSubmitBusiness)}
              className="mt-6 space-y-4"
              noValidate
            >
              <FormField
                label="Company / Organization Name"
                type="text"
                autoComplete="organization"
                error={businessForm.formState.errors.businessName?.message}
                {...businessForm.register('businessName')}
              />
              <FormField
                label="Contact Name"
                type="text"
                autoComplete="name"
                error={businessForm.formState.errors.name?.message}
                {...businessForm.register('name')}
              />
              <FormField
                label="Email"
                type="email"
                autoComplete="email"
                error={businessForm.formState.errors.email?.message}
                {...businessForm.register('email')}
              />
              <FormField
                label="Password"
                type="password"
                autoComplete="new-password"
                error={businessForm.formState.errors.password?.message}
                {...businessForm.register('password')}
              />
              <FormField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                error={businessForm.formState.errors.confirmPassword?.message}
                {...businessForm.register('confirmPassword')}
              />
              <FormField
                label="Business Type"
                type="text"
                placeholder="e.g. E-commerce, Healthcare, Fintech…"
                error={businessForm.formState.errors.businessType?.message}
                {...businessForm.register('businessType')}
              />
              <FormField
                label="Website"
                type="text"
                placeholder="https://yourcompany.com"
                error={businessForm.formState.errors.website?.message}
                {...businessForm.register('website')}
              />
              <FormTextarea
                label="Description"
                placeholder="What does your business do?"
                error={businessForm.formState.errors.description?.message}
                {...businessForm.register('description')}
              />

              {registerMutation.isError && (
                <p className="rounded bg-red-50 p-2 text-sm text-red-700">
                  {getErrorMessage(registerMutation.error)}
                </p>
              )}

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {registerMutation.isPending ? 'Creating account…' : 'Create Business Account'}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
