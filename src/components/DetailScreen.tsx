import {
  ChevronLeft,
  Bookmark,
  Share2,
  Star,
  Calendar,
  Layers,
  BookOpen,
  Heart,
  Sparkles
} from 'lucide-react';
import { Book } from '../types';
import { formatCompactNumber } from '../utils/format';

interface DetailScreenProps {
  book: Book;
  relatedBooks: Book[];
  isFavorite: boolean;
  onToggleFavorite: (book: Book) => void;
  onBack: () => void;
  onSelectRelatedBook: (book: Book) => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  book,
  relatedBooks,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectRelatedBook,
}) => {
  const otherBooks = relatedBooks.filter((b) => b.key !== book.key).slice(0, 5);

  return (
    <div className="flex-1 w-full h-full min-h-[850px] bg-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 select-none animate-in fade-in slide-in-from-right duration-200">
      {/* Top iOS Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[13.5px] font-bold transition"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          <span>Kembali</span>
        </button>

        <span className="text-[14px] font-black tracking-tight text-slate-800">
          Detail Buku
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleFavorite(book)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              isFavorite
                ? 'bg-amber-100 text-amber-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isFavorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          >
            <Bookmark className={`w-4.5 h-4.5 ${isFavorite ? 'fill-amber-600 text-amber-600' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: book.title,
                  url: `https://openlibrary.org${book.key}`,
                }).catch(() => {});
              }
            }}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Detail Body */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Book Cover Showcase with Warm Tint Backdrop */}
        <div className="relative pt-6 pb-8 px-6 bg-gradient-to-b from-[#CBD0F8]/50 via-[#E8EBFD]/30 to-white flex flex-col items-center">
          {/* Large Hero Book Cover */}
          <div className="relative w-44 h-64 rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(30,33,56,0.22)] border-2 border-white/80 bg-slate-800 transform hover:scale-102 transition duration-300">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-4 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-[12px] font-bold">{book.title}</span>
              </div>
            )}
          </div>

          {/* Title & Author */}
          <div className="mt-5 text-center px-4 max-w-sm">
            <h1 className="text-[23px] font-black text-slate-900 leading-tight tracking-tight">
              {book.title}
            </h1>
            <p className="text-[14.5px] font-semibold text-slate-600 mt-2">
              {book.authorNames.length > 0
                ? book.authorNames.join(', ')
                : 'Penulis Tidak Diketahui'}
            </p>

            {/* Rating Banner */}
            <div className="mt-3 inline-flex items-center space-x-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-[13px] font-black text-amber-900">
                {book.ratingsAverage !== undefined ? `${book.ratingsAverage} / 5.0` : 'Katalog Terverifikasi'}
              </span>
              <span className="text-[11px] font-semibold text-amber-700/80">
                • Open Library
              </span>
            </div>
          </div>
        </div>

        {/* 2 Quick Info Matrix Cards: Tahun Terbit & Total Edisi */}
        <div className="px-6 grid grid-cols-2 gap-3 mt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tahun Terbit
              </div>
              <div className="text-[15px] font-extrabold text-slate-900 mt-0.5">
                {book.firstPublishYear ?? '-'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Edisi
              </div>
              <div className="text-[15px] font-extrabold text-slate-900 mt-0.5">
                {formatCompactNumber(book.editionCount ?? 1)} edisi
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Action Button (Clean, without "Buka di Open Library") */}
        <div className="px-6 mt-6">
          <button
            onClick={() => onToggleFavorite(book)}
            className={`w-full py-4 px-5 rounded-2xl text-[14.5px] font-extrabold shadow-sm transition flex items-center justify-center space-x-2.5 ${
              isFavorite
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            <span>{isFavorite ? 'Tersimpan di Favorit Anda' : 'Simpan ke Koleksi Favorit'}</span>
          </button>
        </div>

        {/* Overview & Metadata Description */}
        <div className="px-6 mt-7">
          <h3 className="text-[17px] font-black text-slate-900">
            Tentang Karya Ini
          </h3>
          <p className="text-[13.5px] text-slate-600 leading-relaxed mt-2 font-normal">
            Buku <strong>"{book.title}"</strong> merupakan bagian dari arsip digital di Internet Archive Open Library.
            Pertama kali dicatat publikasi pada tahun <strong>{book.firstPublishYear ?? 'klasik'}</strong> dengan total <strong>{book.editionCount ?? 1} edisi</strong> yang telah terdokumentasikan secara global.
          </p>
        </div>

        {/* Related Books Shelf */}
        {otherBooks.length > 0 && (
          <div className="mt-8">
            <div className="px-6 flex items-center justify-between">
              <h3 className="text-[17px] font-black text-slate-900">
                Buku Terkait Lainnya
              </h3>
              <span className="text-[12px] font-bold text-slate-400">
                {otherBooks.length} Buku
              </span>
            </div>
            <div className="mt-3.5 px-6 flex space-x-3 overflow-x-auto scrollbar-none pb-2">
              {otherBooks.map((rel) => (
                <div
                  key={`rel_${rel.key}`}
                  onClick={() => onSelectRelatedBook(rel)}
                  className="w-24 shrink-0 cursor-pointer group"
                >
                  <div className="h-34 rounded-xl overflow-hidden bg-slate-100 shadow-md group-hover:scale-104 transition duration-200">
                    {rel.coverUrl ? (
                      <img
                        src={rel.coverUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[10px] font-bold p-1 text-center">
                        {rel.title}
                      </div>
                    )}
                  </div>
                  <h4 className="text-[11.5px] font-bold text-slate-800 line-clamp-1 mt-1.5">
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
  );
};
