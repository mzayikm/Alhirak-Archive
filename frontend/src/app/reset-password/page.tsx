'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    }),
    [password],
  );

  function validateForm() {
    if (!token) {
      return 'Invalid reset link';
    }

    if (!passwordRules.length) {
      return 'Password must be at least 8 characters long';
    }

    if (!passwordRules.uppercase || !passwordRules.lowercase || !passwordRules.number) {
      return 'Password must contain uppercase, lowercase, and a number';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      router.push('/login?reset=1');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">New Password</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-xl border px-3 py-3 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p className={passwordRules.length ? 'text-green-600' : ''}>
                • At least 8 characters
              </p>
              <p className={passwordRules.uppercase ? 'text-green-600' : ''}>
                • At least one uppercase letter
              </p>
              <p className={passwordRules.lowercase ? 'text-green-600' : ''}>
                • At least one lowercase letter
              </p>
              <p className={passwordRules.number ? 'text-green-600' : ''}>
                • At least one number
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="rounded-xl border px-3 py-3 text-sm"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Back to{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}