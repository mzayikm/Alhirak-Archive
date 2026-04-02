'use client';

type Language = 'en' | 'ar';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language?: Language;
};

const translations = {
  en: {
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
  },
  ar: {
    page: 'الصفحة',
    of: 'من',
    previous: 'السابق',
    next: 'التالي',
  },
};

function buildPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);

  for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  language = 'en',
}: Props) {
  const t = translations[language];

  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row">
      <div className="text-sm text-gray-500">
        {t.page} <span className="font-semibold text-gray-900">{currentPage}</span>{' '}
        {t.of} <span className="font-semibold text-gray-900">{totalPages}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.previous}
        </button>

        {pages.map((page, index) => {
          const prev = pages[index - 1];
          const showDots = prev && page - prev > 1;

          return (
            <div key={page} className="flex items-center gap-2">
              {showDots ? <span className="px-1 text-gray-400">...</span> : null}

              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${
                  currentPage === page
                    ? 'bg-black text-white shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}