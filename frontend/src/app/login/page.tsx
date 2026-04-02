'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetSuccess = searchParams.get('reset') === '1';
  const signedUp = searchParams.get('signedup') === '1';

  function validateForm() {
    if (!username.trim()) {
      return 'Please enter your username or email';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
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
      await login(username.trim(), password);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid username/email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold">Login</h1>

        {resetSuccess ? (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Password reset successfully. Please log in.
          </p>
        ) : null}

        {signedUp ? (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Account created successfully. You can log in now.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 pr-12"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                    <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
          <Link href="/signup" className="underline">
            Don’t have an account? Sign up
          </Link>
          <Link href="/forgot-password" className="underline">
            Forgot your password?
          </Link>
        </div>
      </div>
    </main>
  );
}