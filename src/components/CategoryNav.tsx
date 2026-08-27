import React from 'react';
import { Category } from '../types';
import { Flame, Utensils, Beef, Cookie, CupSoda, Cake, LayoutGrid, LucideIcon } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryCounts: Record<string, number>;
}

const iconMap: Record<string, LucideIcon> = {
  Flame,
  Utensils,
  Beef,
  Cookie,
  CupSoda,
  Cake,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200/60 transition-all">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
        {/* All Products Tab */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            activeCategoryId === null
              ? 'bg-orange-600 text-white shadow-md shadow-orange-200/80 scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 border border-slate-100 shadow-2xs'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Todos os Itens</span>
        </button>

        {/* Category Tabs */}
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Utensils;
          const isActive = activeCategoryId === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-200/80 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 border border-slate-100 shadow-2xs'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-orange-700/80 text-orange-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
