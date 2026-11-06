import React from 'react';
import { BookOpen, Star, Bookmark } from 'lucide-react';
import { Book } from '../types';
import { formatCompactNumber } from '../utils/format';

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: (book: Book) => void;
  onSelect: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(book)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-3 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Book Cover Container with fixed aspect ratio 2:3 */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-100 shadow-xs mb-3">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Fallback spine if image fails or not available */}
          {!book.coverUrl && (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <BookOpen className="w-8 h-8 text-indigo-300 mb-2 opacity-80" />
              <span className="text-xs font-bold line-clamp-3 leading-snug">
                {book.title}
              </span>
            </div>
          )}

          {/* Favorite Bookmark Button (Top Right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book);
            }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-sm ${
              isFavorite
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
            title={isFavorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          >
            <Bookmark
              className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`}
            />
          </button>

          {/* Rating Badge (Top Left, if available) */}
          {book.ratingsAverage !== undefined && (
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-amber-300 text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center space-x-1 shadow-sm">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>{book.ratingsAverage}</span>
            </div>
          )}
        </div>

        {/* Title & Author */}
        <h3 className="text-sm font-extrabold text-[#1E2138] leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
          {book.authorNames.length > 0
            ? book.authorNames.join(', ')
            : 'Penulis Tidak Diketahui'}
        </p>
      </div>

      {/* Footer Info: Year & Edition */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <span>{book.firstPublishYear ?? 'Edisi klasik'}</span>
        <span>
          {book.editionCount
            ? `${formatCompactNumber(book.editionCount)} edisi`
            : '1 edisi'}
        </span>
      </div>
    </div>
  );
};

