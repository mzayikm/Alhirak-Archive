'use client';

import { useEffect, useState } from 'react';
import { fetchArticleById } from '@/lib/api';
import AuthGate from '@/components/AuthGate';
import { removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function getAuthorName(article: any) {
  return (
    article.author?.name ||
    article.author?.displayName ||
    article.author?.fullName ||
    article.author?.username ||
    'Unknown'
  );
}

function ArticleDetailsContent({ id }: { id: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');

        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (e: any) {
        const message =
          typeof e?.message === 'string' ? e.message.toLowerCase() : '';

        if (
          message.includes('unauthorized') ||
          message.includes('401') ||
          message.includes('jwt') ||
          message.includes('token')
        ) {
          removeToken();
          router.push('/login');
          return;
        }

        setError('Failed to load article.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-3xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Loading article...</p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while the article is being fetched.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <p className="mt-2 text-sm text-gray-500">
            The article could not be displayed right now.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-5 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to archive
          </button>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-3xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Article not found</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-5 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to archive
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mb-6 rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Back to archive
        </button>

        <article className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          {article.thumbnail && !article.thumbnail.includes('example.com') ? (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="h-80 w-full object-cover md:h-[420px]"
            />
          ) : (
            <div className="flex h-80 w-full items-center justify-center bg-gray-100 text-gray-500 md:h-[420px]">
              No image
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              {article.category?.name ? (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
                  {article.category.name}
                </span>
              ) : null}

              {article.featured ? (
                <span className="rounded-full bg-black px-3 py-1.5 font-medium text-white">
                  Featured
                </span>
              ) : null}

              {article.published === false ? (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 font-medium text-amber-800">
                  Unpublished
                </span>
              ) : null}
            </div>

            <h1 className="mb-5 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              {article.title}
            </h1>

            <div className="mb-8 grid gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-3">
              <div>
                <p className="font-medium text-gray-800">Date</p>
                <p className="mt-1">
                  {article.date
                    ? new Date(article.date).toLocaleDateString()
                    : 'No date'}
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-800">Author</p>
                <p className="mt-1">{getAuthorName(article)}</p>
              </div>

              <div>
                <p className="font-medium text-gray-800">Category</p>
                <p className="mt-1">{article.category?.name || 'No category'}</p>
              </div>
            </div>

            <div className="space-y-6">
              {article.blocks?.map((block: any, index: number) => {
                if (block.type === 'text') {
                  return (
                    <div
                      key={index}
                      className="prose prose-lg max-w-none leading-8 text-gray-800"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  );
                }

                if (block.type === 'image') {
                  const imageSrc = block.contentNew || block.content;

                  if (!imageSrc || imageSrc.includes('example.com')) {
                    return (
                      <div
                        key={index}
                        className="flex h-64 w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-500"
                      >
                        No image
                      </div>
                    );
                  }

                  return (
                    <img
                      key={index}
                      src={imageSrc}
                      alt={`Article image ${index + 1}`}
                      className="w-full rounded-2xl border border-gray-200"
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

export default function ArticleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resolvedId, setResolvedId] = useState<string>('');

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setResolvedId(resolved.id);
    }

    resolveParams();
  }, [params]);

  if (!resolvedId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-3xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Loading article...</p>
        </div>
      </main>
    );
  }

  return (
    <AuthGate>
      <ArticleDetailsContent id={resolvedId} />
    </AuthGate>
  );
}