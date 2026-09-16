import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../components/FormField';
import { useRegister } from '../hooks/useRegister';
import { registerFormSchema } from '../utils/authValidation';
import type { RegisterFormValues } from '../utils/authValidation';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: 'developer' },
  });

  const selectedRole = watch('role');

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      },
      {
        onSuccess: () => setSubmittedEmail(values.email),
      }
    );
  };

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-medium text-green-800">Account created for {submittedEmail}</p>
          <p className="mt-2 text-sm text-green-700">You can now sign in.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join SkillBridge as a developer or business.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <span className="block text-sm font-medium text-slate-700">I am a…</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['developer', 'business'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue('role', role, { shouldValidate: true })}
                  className={`rounded-md border px-3 py-2 text-sm font-medium capitalize ${
                    selectedRole === role
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div>

          <FormField
            label="Full name"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <FormField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {registerMutation.isError && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700">
              {getErrorMessage(registerMutation.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
