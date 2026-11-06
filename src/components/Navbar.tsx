import React from 'react';
import { BookOpen, Search, X, Bookmark, Compass } from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'favorites';
  onTabChange: (tab: 'catalog' | 'favorites') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onClearSearch,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('catalog')}
            className="flex items-center space-x-3 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#CBD0F8] text-[#1E2138] flex items-center justify-center font-black shadow-xs">
              <BookOpen className="w-5 h-5 text-[#1E2138]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black text-[#1E2138] tracking-tight">
                  litera
                </span>
                <span className="hidden md:inline text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Open Library REST API
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Digital Library Explorer
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative flex items-center bg-slate-100/90 focus-within:bg-white rounded-2xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search className="w-4.5 h-4.5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari judul buku, pengarang, subjek..."
                className="w-full py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={() => onTabChange('catalog')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Katalog</span>
            </button>

            <button
              onClick={() => onTabChange('favorites')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition relative ${
                activeTab === 'favorites'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Favorit</span>
              {favoritesCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (visible on smaller screens) */}
        <div className="pb-3 pt-1 md:hidden">
          <div className="relative flex items-center bg-slate-100 focus-within:bg-white rounded-2xl border border-slate-200 px-3 py-2 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari judul atau pengarang..."
              className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

