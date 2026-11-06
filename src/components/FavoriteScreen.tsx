import React, { useState } from 'react';
import { Bookmark, Search, ArrowRight, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface FavoriteScreenProps {
  favoriteBooks: Book[];
  onSelectBook: (book: Book) => void;
  onToggleFavorite: (book: Book) => void;
  onExploreMore: () => void;
}

export const FavoriteScreen: React.FC<FavoriteScreenProps> = ({
  favoriteBooks,
  onSelectBook,
  onToggleFavorite,
  onExploreMore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = favoriteBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.authorNames.some((a) =>
        a.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 mb-1">
            <Bookmark className="w-5 h-5 fill-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider">
              Koleksi Pribadi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E2138] tracking-tight">
            Buku Favorit Tersimpan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {favoriteBooks.length} buku tersimpan secara lokal di browser Anda
          </p>
        </div>

        {/* Search within favorites */}
        {favoriteBooks.length > 0 && (
          <div className="w-full md:w-80">
            <div className="relative flex items-center bg-slate-100 rounded-2xl border border-slate-200 px-3.5 py-2.5 focus-within:bg-white focus-within:border-indigo-400 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam koleksi favorit..."
                className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {favoriteBooks.length === 0 ? (
        /* Empty Favorites State */
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 shadow-xs flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shadow-xs mb-4">
            <Bookmark className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Belum Ada Buku Favorit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
            Jelajahi ribuan judul buku di menu Katalog, lalu klik ikon bookmark pada kartu buku atau halaman detail untuk menyimpannya ke koleksi ini.
          </p>
          <button
            onClick={onExploreMore}
            className="mt-6 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Jelajahi Katalog Buku</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
          Tidak ditemukan buku favorit yang cocok dengan kata kunci "{searchQuery}".
        </div>
      ) : (
        /* Responsive Grid of Favorite Books */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.key}
              book={book}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
