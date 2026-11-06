import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Book } from '../types';

interface WoodenShelfProps {
  books: Book[];
  isLoading: boolean;
  onSelectBook: (book: Book) => void;
  categoryName: string;
}

export const WoodenShelf: React.FC<WoodenShelfProps> = ({
  books,
  isLoading,
  onSelectBook,
  categoryName,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const showcaseBooks = books.slice(0, 12);

  return (
    <div className="relative bg-[#CBD0F8]/40 border border-[#CBD0F8] rounded-3xl p-5 sm:p-7 overflow-hidden shadow-xs">
      {/* Top Header of Shelf */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#1E2138] leading-tight">
              Rak Pilihan • {categoryName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Buku terpopuler dari repositori Open Library
            </p>
          </div>
        </div>

        {/* Scroll Controls (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center space-x-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs transition"
            title="Gulir ke Kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs transition"
            title="Gulir ke Kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Books row & Shelf structure */}
      <div className="relative pt-2 pb-6">
        <div
          ref={scrollRef}
          className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 px-2 scrollbar-none scroll-smooth"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-32 sm:w-36 h-48 sm:h-52 shrink-0 rounded-2xl bg-white/60 animate-pulse"
              />
            ))
          ) : showcaseBooks.length > 0 ? (
            showcaseBooks.map((book) => (
              <div
                key={`shelf_${book.key}`}
                onClick={() => onSelectBook(book)}
                className="w-32 sm:w-36 h-48 sm:h-52 shrink-0 rounded-2xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.22)] cursor-pointer transform hover:-translate-y-2.5 transition duration-300 group relative bg-slate-900 border border-white/40"
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}

                {/* Spine Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2.5 pointer-events-none">
                  <p className="text-xs font-black text-white leading-tight line-clamp-2 drop-shadow-md">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                    {book.authorNames[0] ?? ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-8 text-center text-xs text-slate-500 font-medium">
              Tidak ada buku yang dapat ditampilkan di rak saat ini.
            </div>
          )}
        </div>

        {/* WARM BROWN REALISTIC WOODEN SHELF BAR */}
        <div className="absolute bottom-0 left-0 right-0 h-7 sm:h-8 rounded-xl bg-gradient-to-r from-[#4A2D17] via-[#6A4122] to-[#4A2D17] border-t-2 border-[#8E5B32] shadow-[0_6px_16px_rgba(40,20,10,0.35)] flex items-center justify-between px-4 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-xs border border-amber-300 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-amber-900/80 rounded-full rotate-45"></div>
          </div>
          <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-amber-100/90 drop-shadow-xs">
            OPEN LIBRARY DIGITAL SHELF
          </div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-xs border border-amber-300 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-amber-900/80 rounded-full rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

