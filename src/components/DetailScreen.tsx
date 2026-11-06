import React, { useEffect } from 'react';
import {
  X,
  Bookmark,
  Share2,
  Star,
  Calendar,
  Layers,
  BookOpen,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Book } from '../types';
import { formatCompactNumber } from '../utils/format';

interface DetailScreenProps {
  book: Book;
  relatedBooks: Book[];
  isFavorite: boolean;
  onToggleFavorite: (book: Book) => void;
  onClose: () => void;
  onSelectRelatedBook: (book: Book) => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  book,
  relatedBooks,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectRelatedBook,
}) => {
  const otherBooks = relatedBooks
    .filter((b) => b.key !== book.key)
    .slice(0, 6);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: book.title,
          text: `Lihat buku "${book.title}" di Open Library`,
          url: `https://openlibrary.org${book.key}`,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`https://openlibrary.org${book.key}`);
      alert('Tautan buku berhasil disalin ke clipboard!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Cover & Quick Actions */}
        <div className="md:w-5/12 bg-gradient-to-b from-[#CBD0F8]/50 via-[#E8EBFD]/30 to-slate-50 p-6 sm:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div className="w-full flex justify-between items-center md:hidden mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Detail Buku
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Book Cover */}
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(30,33,56,0.22)] border-2 border-white bg-slate-900 group">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-xs font-bold">{book.title}</span>
              </div>
            )}
          </div>

          {/* Quick Buttons below cover */}
          <div className="w-full mt-6 space-y-2.5">
            <button
              onClick={() => onToggleFavorite(book)}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold shadow-xs transition flex items-center justify-center space-x-2 ${
                isFavorite
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`}
              />
              <span>
                {isFavorite ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <a
                href={`https://openlibrary.org${book.key}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center justify-center space-x-1.5"
              >
                <span>Open Library</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                title="Bagikan Tautan"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Book Details, Meta, Related */}
        <div className="md:w-7/12 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Desktop Close Button */}
            <div className="hidden md:flex justify-end mb-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rating Tag */}
            {book.ratingsAverage !== undefined && (
              <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full text-xs font-extrabold text-amber-900 mb-3">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{book.ratingsAverage} / 5.0</span>
                <span className="text-amber-700 font-semibold">• Open Library Rating</span>
              </div>
            )}

            {/* Title & Author */}
            <h1 className="text-xl sm:text-2xl font-black text-[#1E2138] leading-tight">
              {book.title}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1.5">
              {book.authorNames.length > 0
                ? book.authorNames.join(', ')
                : 'Penulis Tidak Diketahui'}
            </p>

            {/* Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-bold uppercase">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tahun Terbit</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {book.firstPublishYear ?? 'Klasik'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-bold uppercase">
                  <Layers className="w-3.5 h-3.5 text-violet-500" />
                  <span>Total Edisi</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {formatCompactNumber(book.editionCount ?? 1)} edisi
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Full Text</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {book.hasFullText ? 'Tersedia' : 'Hanya Metadata'}
                </div>
              </div>
            </div>

            {/* Synopsis / Description */}
            <div className="mt-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Tentang Buku Ini
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 font-normal">
                Buku <strong>"{book.title}"</strong> terdata di arsip digital Open Library Internet Archive dengan identifier karya <code>{book.key}</code>.
                Tercatat pertama kali dipublikasikan pada tahun <strong>{book.firstPublishYear ?? 'klasik'}</strong> dan memiliki sekitar <strong>{book.editionCount ?? 1} edisi</strong> yang terdaftar dalam katalog literatur publik.
              </p>
            </div>

            {/* Related Books */}
            {otherBooks.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Buku Terkait Lainnya
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {otherBooks.length} Buku
                  </span>
                </div>

                <div className="flex space-x-3 overflow-x-auto scrollbar-none pb-2">
                  {otherBooks.map((rel) => (
                    <div
                      key={`rel_${rel.key}`}
                      onClick={() => onSelectRelatedBook(rel)}
                      className="w-20 sm:w-24 shrink-0 cursor-pointer group"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-200/80 group-hover:scale-104 transition duration-200">
                        {rel.coverUrl ? (
                          <img
                            src={rel.coverUrl}
                            alt={rel.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[9px] font-bold p-1 text-center">
                            {rel.title}
                          </div>
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1 mt-1 group-hover:text-indigo-600">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {rel.authorNames[0] ?? ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
