'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CategoriesList from '@/components/CategoriesList';
import ArticlesList from '@/components/ArticlesList';
import PaginationControls from '@/components/PaginationControls';
import { fetchArticles, fetchCategories, logout } from '@/lib/api';
import { Article, ArticlesResponse, Category } from '@/types/archive';

type Language = 'en' | 'ar';

const translations = {
  en: {
    dir: 'ltr' as const,
    platform: 'Internal Archive Platform',
    title: 'Alhirak Archive',
    subtitle: 'Browse archived articles and search historical content quickly.',
    logout: 'Logout',
    langButton: 'العربية',
    searchSection: 'Search',
    findArticles: 'Find articles',
    filters: 'Filters',
    hideFilters: 'Hide Filters',
    searchPlaceholder: 'Search articles...',
    searchButton: 'Search',
    sort: 'Sort',
    newest: 'Newest first',
    oldest: 'Oldest first',
    published: 'Published',
    publishedOnly: 'Published',
    unpublished: 'Unpublished',
    all: 'All',
    author: 'Author',
    authorPlaceholder: 'Author name',
    fromDate: 'From date',
    toDate: 'To date',
    perPage: 'Per page',
    applyFilters: 'Apply Filters',
    reset: 'Reset',
    searchResults: 'Search results',
    resultsFound: 'results found',
    resultFound: 'result found',
    pageOf: 'Page',
    of: 'of',
    loadingTitle: 'Loading articles...',
    loadingText: 'Please wait while the archive is fetched.',
    recentArticles: 'Recent Articles',
    recentSubtitle: 'Latest archived content',
    readMore: 'Read article',
  },
  ar: {
    dir: 'rtl' as const,
    platform: 'منصة الأرشيف الداخلية',
    title: 'أرشيف الحراك',
    subtitle: 'تصفّح المقالات المؤرشفة وابحث داخل المحتوى التاريخي بسرعة.',
    logout: 'تسجيل الخروج',
    langButton: 'English',
    searchSection: 'البحث',
    findArticles: 'ابحث في المقالات',
    filters: 'الفلاتر',
    hideFilters: 'إخفاء الفلاتر',
    searchPlaceholder: 'ابحث في المقالات...',
    searchButton: 'بحث',
    sort: 'الترتيب',
    newest: 'الأحدث أولاً',
    oldest: 'الأقدم أولاً',
    published: 'النشر',
    publishedOnly: 'المنشور',
    unpublished: 'غير المنشور',
    all: 'الكل',
    author: 'الكاتب',
    authorPlaceholder: 'اسم الكاتب',
    fromDate: 'من تاريخ',
    toDate: 'إلى تاريخ',
    perPage: 'عدد النتائج',
    applyFilters: 'تطبيق الفلاتر',
    reset: 'إعادة ضبط',
    searchResults: 'نتائج البحث',
    resultsFound: 'نتيجة',
    resultFound: 'نتيجة',
    pageOf: 'الصفحة',
    of: 'من',
    loadingTitle: 'جارٍ تحميل المقالات...',
    loadingText: 'يرجى الانتظار أثناء تحميل الأرشيف.',
    recentArticles: 'أحدث المقالات',
    recentSubtitle: 'أحدث محتوى مؤرشف',
    readMore: 'قراءة المقال',
  },
};

function buildQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
}

function getAuthorName(article: Article) {
  return (
    article.author?.name ||
    article.author?.displayName ||
    article.author?.fullName ||
    article.author?.username ||
    'Unknown'
  );
}

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') || undefined;
  const appliedSearch = searchParams.get('search') || '';
  const appliedAuthor = searchParams.get('author') || '';
  const appliedDateFrom = searchParams.get('dateFrom') || '';
  const appliedDateTo = searchParams.get('dateTo') || '';
  const appliedSort = searchParams.get('sort') || 'newest';
  const appliedPublished =
    (searchParams.get('published') as 'true' | 'false' | 'all' | null) || 'true';
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '9');

  const [language, setLanguage] = useState<Language>('en');
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [articlesResponse, setArticlesResponse] = useState<ArticlesResponse>({
    data: [],
    pagination: { total: 0, page: 1, limit: 9, totalPages: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(appliedSearch);
  const [authorInput, setAuthorInput] = useState(appliedAuthor);
  const [dateFromInput, setDateFromInput] = useState(appliedDateFrom);
  const [dateToInput, setDateToInput] = useState(appliedDateTo);
  const [sortInput, setSortInput] = useState(appliedSort);
  const [publishedInput, setPublishedInput] = useState<'true' | 'false' | 'all'>(
    appliedPublished,
  );
  const [limitInput, setLimitInput] = useState(String(limit));

  const t = translations[language];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('archive-language') as Language | null;
    if (savedLanguage === 'en' || savedLanguage === 'ar') {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('archive-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = translations[language].dir;
  }, [language]);

  useEffect(() => {
    setSearchInput(appliedSearch);
    setAuthorInput(appliedAuthor);
    setDateFromInput(appliedDateFrom);
    setDateToInput(appliedDateTo);
    setSortInput(appliedSort);
    setPublishedInput(appliedPublished);
    setLimitInput(String(limit));
  }, [
    appliedSearch,
    appliedAuthor,
    appliedDateFrom,
    appliedDateTo,
    appliedSort,
    appliedPublished,
    limit,
  ]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [cats, arts, recent] = await Promise.all([
          fetchCategories(),
          fetchArticles({
            page,
            limit,
            category: selectedCategory,
            search: appliedSearch || undefined,
            author: appliedAuthor || undefined,
            dateFrom: appliedDateFrom || undefined,
            dateTo: appliedDateTo || undefined,
            sort: appliedSort,
            published: appliedPublished,
          }),
          fetchArticles({
            page: 1,
            limit: 3,
            sort: 'newest',
            published: 'true',
          }),
        ]);

        setCategories(cats);
        setArticlesResponse(arts);
        setRecentArticles(recent.data || []);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [
    selectedCategory,
    appliedSearch,
    appliedAuthor,
    appliedDateFrom,
    appliedDateTo,
    appliedSort,
    appliedPublished,
    page,
    limit,
    router,
  ]);

  function updateFilters(next: Record<string, string | undefined>) {
    const query = buildQueryString({
      category: selectedCategory,
      search: appliedSearch,
      author: appliedAuthor,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      sort: appliedSort,
      published: appliedPublished,
      page: String(page),
      limit: String(limit),
      ...next,
    });

    router.push(query ? `/?${query}` : '/');
  }

  function handleCategoryChange(category?: string) {
    updateFilters({
      category,
      page: '1',
    });
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();

    updateFilters({
      search: searchInput || undefined,
      page: '1',
    });
  }

  function handleApplyFilters(e: FormEvent) {
    e.preventDefault();

    updateFilters({
      search: searchInput || undefined,
      author: authorInput || undefined,
      dateFrom: dateFromInput || undefined,
      dateTo: dateToInput || undefined,
      sort: sortInput || 'newest',
      published: publishedInput,
      limit: limitInput || '9',
      page: '1',
    });
  }

  function handleReset() {
    setSearchInput('');
    setAuthorInput('');
    setDateFromInput('');
    setDateToInput('');
    setSortInput('newest');
    setPublishedInput('true');
    setLimitInput('9');
    setShowFilters(false);
    router.push('/');
  }

  function handlePageChange(nextPage: number) {
    updateFilters({
      page: String(nextPage),
    });
  }

  function toggleLanguage() {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  const hasActiveSearchOrFilters = useMemo(() => {
    return Boolean(
      appliedSearch ||
        appliedAuthor ||
        appliedDateFrom ||
        appliedDateTo ||
        appliedSort !== 'newest' ||
        appliedPublished !== 'true' ||
        limit !== 9,
    );
  }, [
    appliedSearch,
    appliedAuthor,
    appliedDateFrom,
    appliedDateTo,
    appliedSort,
    appliedPublished,
    limit,
  ]);

  return (
    <main
      dir={t.dir}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-6 md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                {t.platform}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                {t.subtitle}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {t.langButton}
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {t.searchSection}
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {t.findArticles}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {showFilters ? t.hideFilters : t.filters}
            </button>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
            />

            <button
              type="submit"
              className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t.searchButton}
            </button>
          </form>

          {showFilters ? (
            <form
              onSubmit={handleApplyFilters}
              className="mt-5 border-t border-gray-200 pt-5"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.sort}
                  </label>
                  <select
                    value={sortInput}
                    onChange={(e) => setSortInput(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  >
                    <option value="newest">{t.newest}</option>
                    <option value="oldest">{t.oldest}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.published}
                  </label>
                  <select
                    value={publishedInput}
                    onChange={(e) =>
                      setPublishedInput(e.target.value as 'true' | 'false' | 'all')
                    }
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  >
                    <option value="true">{t.publishedOnly}</option>
                    <option value="false">{t.unpublished}</option>
                    <option value="all">{t.all}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.author}
                  </label>
                  <input
                    type="text"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    placeholder={t.authorPlaceholder}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.fromDate}
                  </label>
                  <input
                    type="date"
                    value={dateFromInput}
                    onChange={(e) => setDateFromInput(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.toDate}
                  </label>
                  <input
                    type="date"
                    value={dateToInput}
                    onChange={(e) => setDateToInput(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="w-full md:max-w-[180px]">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.perPage}
                  </label>
                  <select
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  >
                    <option value="6">6</option>
                    <option value="9">9</option>
                    <option value="12">12</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-2xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90"
                  >
                    {t.applyFilters}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-2xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    {t.reset}
                  </button>
                </div>
              </div>
            </form>
          ) : null}
        </div>

        {!hasActiveSearchOrFilters && !loading && recentArticles.length > 0 ? (
          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                  {t.recentSubtitle}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t.recentArticles}
                </h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {recentArticles.map((article) => (
                <Link
                  key={article._id}
                  href={`/articles/${article._id}`}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    {article.category?.name ? (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-medium text-gray-700">
                        {article.category.name}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-black px-3 py-1 font-medium text-white">
                      {t.recentArticles}
                    </span>
                  </div>

                  <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-gray-900">
                    {article.title}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      {article.date
                        ? new Date(article.date).toLocaleDateString()
                        : ''}
                    </p>
                    <p>{getAuthorName(article)}</p>
                  </div>

                  <div className="mt-4 text-sm font-semibold text-black">
                    {t.readMore}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <CategoriesList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          language={language}
        />

        {hasActiveSearchOrFilters && !loading ? (
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">{t.searchResults}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {articlesResponse.pagination.total}{' '}
                  {articlesResponse.pagination.total === 1
                    ? t.resultFound
                    : t.resultsFound}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {t.pageOf} {articlesResponse.pagination.page} {t.of}{' '}
                {articlesResponse.pagination.totalPages}
              </div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-800">{t.loadingTitle}</p>
            <p className="mt-2 text-sm text-gray-500">{t.loadingText}</p>
          </div>
        ) : (
          <>
            <ArticlesList articles={articlesResponse.data} language={language} />

            <PaginationControls
              currentPage={articlesResponse.pagination.page}
              totalPages={articlesResponse.pagination.totalPages}
              onPageChange={handlePageChange}
              language={language}
            />
          </>
        )}
      </div>
    </main>
  );
}