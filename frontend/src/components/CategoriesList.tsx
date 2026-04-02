'use client';

import { Category } from '@/types/archive';

type Language = 'en' | 'ar';

type Props = {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
  language?: Language;
};

const translations = {
  en: {
    browse: 'Browse',
    categories: 'Categories',
    all: 'All',
  },
  ar: {
    browse: 'تصفّح',
    categories: 'الفئات',
    all: 'الكل',
  },
};

export default function CategoriesList({
  categories,
  selectedCategory,
  onSelectCategory,
  language = 'en',
}: Props) {
  const t = translations[language];

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            {t.browse}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">{t.categories}</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
            !selectedCategory
              ? 'border-black bg-black text-white shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {t.all}
        </button>

        {categories.map((category) => {
          const isActive = selectedCategory === category.name;

          return (
            <button
              key={category._id}
              type="button"
              onClick={() => onSelectCategory(category.name)}
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-black bg-black text-white shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}