import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Star,
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Heart
} from 'lucide-react';
import { Book } from '../types';
import { formatCompactNumber } from '../utils/format';

interface FavoriteScreenProps {
  favoriteBooks: Book[];
  onSelectBook: (book: Book) => void;
  onRemoveFavorite: (bookKey: string) => void;
  onExploreMore: () => void;
}

export const FavoriteScreen: React.FC<FavoriteScreenProps> = ({
  favoriteBooks,
  onSelectBook,
  onRemoveFavorite,
  onExploreMore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = favoriteBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.authorNames.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto pb-24 font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50 text-slate-900 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-black text-slate-900 leading-tight">
            Koleksi Favorit
          </h2>
          <p className="text-[12px] text-slate-500 font-medium">
            {favoriteBooks.length} buku tersimpan di perangkat Anda
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
          <Bookmark className="w-5 h-5 fill-amber-500 text-amber-500" />
        </div>
      </div>

      {/* Search in Favorites (if > 1 book) */}
      {favoriteBooks.length > 0 && (
        <div className="px-6 mt-4">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari di buku favorit..."
              className="w-full text-[13.5px] font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 mt-5">
        {favoriteBooks.length === 0 ? (
          /* Empty Favorites State */
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-sm mb-4">
              <Bookmark className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-[18px] font-black text-slate-800">
              Belum Ada Buku Favorit
            </h3>
            <p className="text-[13px] text-slate-500 max-w-xs mt-1.5 leading-relaxed font-normal">
              Buka katalog buku di menu Beranda, lalu ketuk ikon bookmark untuk menyimpan buku pilihan Anda ke sini.
            </p>
            <button
              onClick={onExploreMore}
              className="mt-6 px-6 py-3 rounded-2xl bg-slate-900 text-white text-[13.5px] font-bold shadow-md hover:bg-slate-800 transition flex items-center space-x-2"
            >
              <span>Jelajahi Katalog Buku</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Tidak ada buku favorit yang cocok dengan kata kunci "{searchQuery}".
          </div>
        ) : (
          /* List of Favorite Books */
          <div className="space-y-3.5">
            {filteredBooks.map((book) => (
              <div
                key={book.key}
                onClick={() => onSelectBook(book)}
                className="group p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-3">
                  <div className="w-16 h-22 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm relative">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-extrabold text-slate-900 leading-snug truncate">
                      {book.title}
                    </h4>
                    <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">
                      {book.authorNames.length > 0 ? book.authorNames[0] : 'Penulis Tidak Diketahui'}
                    </p>
                    <div className="mt-2 flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
                      <span>{book.firstPublishYear ?? '-'}</span>
                      <span>•</span>
                      <span>{formatCompactNumber(book.editionCount ?? 1)} edisi</span>
                      {book.ratingsAverage !== undefined && (
                        <>
                          <span>•</span>
                          <span className="flex items-center text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                            {book.ratingsAverage}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove from Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(book.key);
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shrink-0"
                  title="Hapus dari Favorit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
