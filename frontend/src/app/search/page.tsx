'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ArticlesList from '@/components/ArticlesList';
import AuthGate from '@/components/AuthGate';
import { searchArticles } from '@/lib/api';
import { removeToken } from '@/lib/auth';

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get('q') || '';

  const [result, setResult] = useState<{ data: any[]; total: number }>({
    data: [],
    total: 0,
  });

  useEffect(() => {
    async function load() {
      if (!query) return;

      try {
        const res = await searchArticles(query);
        setResult(res);
      } catch (e) {
        removeToken();
        router.push('/login');
      }
    }

    load();
  }, [query, router]);

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Search</h1>

        <form action="/search" className="mb-6 flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search articles..."
            className="w-full rounded-lg border px-4 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Search
          </button>
        </form>

        {query ? (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Results for: <span className="font-semibold">{query}</span> ({result.total})
            </p>
            <ArticlesList articles={result.data} />
          </>
        ) : (
          <p className="text-gray-600">Type something to search.</p>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <AuthGate>
      <SearchContent />
    </AuthGate>
  );
}