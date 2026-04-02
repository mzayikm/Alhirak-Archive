'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Article } from '@/types/archive';

type Language = 'en' | 'ar';

type Props = {
  articles: Article[];
  language?: Language;
};

const translations = {
  en: {
    archive: 'Archive',
    articles: 'Articles',
    noArticles: 'No articles found',
    noArticlesText: 'Try changing the filters, search term, or date range.',
    noImage: 'No image',
    featured: 'Featured',
    unpublished: 'Unpublished',
    date: 'Date',
    author: 'Author',
    noDate: 'No date',
    unknown: 'Unknown',
  },
  ar: {
    archive: 'الأرشيف',
    articles: 'المقالات',
    noArticles: 'لم يتم العثور على مقالات',
    noArticlesText: 'جرّب تغيير الفلاتر أو كلمة البحث أو نطاق التاريخ.',
    noImage: 'لا توجد صورة',
    featured: 'مميز',
    unpublished: 'غير منشور',
    date: 'التاريخ',
    author: 'الكاتب',
    noDate: 'لا يوجد تاريخ',
    unknown: 'غير معروف',
  },
};

function ArticleImage({
  src,
  alt,
  noImageText,
}: {
  src?: string;
  alt: string;
  noImageText: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed || src.includes('example.com')) {
    return (
      <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
        {noImageText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      onError={() => setFailed(true)}
    />
  );
}

function getAuthorName(article: Article, unknownText: string) {
  return (
    article.author?.name ||
    article.author?.displayName ||
    article.author?.fullName ||
    article.author?.username ||
    unknownText
  );
}

export default function ArticlesList({
  articles = [],
  language = 'en',
}: Props) {
  const t = translations[language];

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            {t.archive}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">{t.articles}</h2>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">{t.noArticles}</p>
          <p className="mt-2 text-sm text-gray-500">{t.noArticlesText}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/articles/${article._id}`}
              className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="overflow-hidden">
                <ArticleImage
                  src={article.thumbnail}
                  alt={article.title}
                  noImageText={t.noImage}
                />
              </div>

              <div className="p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                  {article.category?.name ? (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-medium text-gray-700">
                      {article.category.name}
                    </span>
                  ) : null}

                  {article.featured ? (
                    <span className="rounded-full bg-black px-3 py-1 font-medium text-white">
                      {t.featured}
                    </span>
                  ) : null}

                  {article.published === false ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                      {t.unpublished}
                    </span>
                  ) : null}
                </div>

                <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-gray-900">
                  {article.title}
                </h3>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">{t.date}:</span>{' '}
                    {article.date
                      ? new Date(article.date).toLocaleDateString()
                      : t.noDate}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">{t.author}:</span>{' '}
                    {getAuthorName(article, t.unknown)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}