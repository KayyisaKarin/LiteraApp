import React from 'react';

export interface Category {
  name: string;
  query: string;
  count?: string;
}

export const CATEGORIES: Category[] = [
  { name: 'Semua', query: 'bestseller', count: '100+' },
  { name: 'Design', query: 'Design', count: '10' },
  { name: 'Teknologi', query: 'Computer Science', count: '15' },
  { name: 'Fantasy', query: 'Fantasy', count: '8' },
  { name: 'Mystery', query: 'Mystery', count: '12' },
  { name: 'Science', query: 'Science', count: '14' },
  { name: 'History', query: 'World History', count: '9' },
  { name: 'Philosophy', query: 'Philosophy', count: '7' },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto scrollbar-none py-1">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
              isSelected
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <span>{cat.name}</span>
            {cat.count && (
              <span
                className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

