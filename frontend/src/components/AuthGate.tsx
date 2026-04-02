'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe } from '@/lib/api';

type Props = {
  children: ReactNode;
};

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        await fetchMe();
        setReady(true);
      } catch {
        router.push('/login');
      }
    }

    checkAuth();
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return <>{children}</>;
}