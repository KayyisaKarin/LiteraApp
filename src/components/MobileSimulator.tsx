import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Zap,
  XCircle,
  Home,
  Bookmark,
  ArrowDown
} from 'lucide-react';
import { Book } from '../types';
import { searchOpenLibrary } from '../services/openLibrary';
import { formatCompactNumber } from '../utils/format';
import { DetailScreen } from './DetailScreen';
import { FavoriteScreen } from './FavoriteScreen';

const CATEGORIES = [
  { name: 'All', query: 'bestseller', count: '23' },
  { name: 'Design', query: 'Design', count: '10' },
  { name: 'Fantasy', query: 'Fantasy', count: '5' },
  { name: 'Mystery', query: 'Mystery', count: '8' },
  { name: 'Science', query: 'Computer Science', count: '12' },
];

const INITIAL_FAVORITES: Book[] = [
  {
    key: '/works/OL82563W',
    title: 'The Design of Everyday Things',
    authorNames: ['Don Norman'],
    firstPublishYear: 1988,
    coverId: 10521270,
    editionCount: 24,
    hasFullText: true,
    ratingsAverage: 4.65,
    coverUrl: 'https://covers.openlibrary.org/b/id/10521270-M.jpg',
  },
  {
    key: '/works/OL82586W',
    title: 'Bauhaus: 1919-1933',
    authorNames: ['Magdalena Droste'],
    firstPublishYear: 1990,
    coverId: 10523362,
    editionCount: 15,
    hasFullText: false,
    ratingsAverage: 4.52,
    coverUrl: 'https://covers.openlibrary.org/b/id/10523362-M.jpg',
  },
];

export const MobileSimulator: React.FC = () => {
  // Navigation: Tab ('home' | 'favorite') and Active Detail Book
  const [activeTab, setActiveTab] = useState<'home' | 'favorite'>('home');
  const [activeDetailBook, setActiveDetailBook] = useState<Book | null>(null);

  // Favorites state with localStorage fallback
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('dl_favorite_books');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_FAVORITES;
  });

  const saveFavorites = (booksList: Book[]) => {
    setFavoriteBooks(booksList);
    try {
      localStorage.setItem('dl_favorite_books', JSON.stringify(booksList));
    } catch (_) {}
  };

  const toggleFavorite = (book: Book) => {
    const exists = favoriteBooks.some((b) => b.key === book.key);
    if (exists) {
      saveFavorites(favoriteBooks.filter((b) => b.key !== book.key));
    } else {
      saveFavorites([book, ...favoriteBooks]);
    }
  };

  const isFavorite = (bookKey: string) => favoriteBooks.some((b) => b.key === bookKey);

  // Search & Catalog State
  const [selectedCategory, setSelectedCategory] = useState<string>('Design');
  const [searchQuery, setSearchQuery] = useState<string>('Design');
  const [inputValue, setInputValue] = useState<string>('Design');
  const [books, setBooks] = useState<Book[]>([]);
  const [numFound, setNumFound] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);

  // Pull-to-Refresh State
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeSearch = async (
    query: string,
    offset: number = 0,
    isAppend: boolean = false
  ) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setBooks([]);
      setNumFound(0);
      setIsLoading(false);
      setIsLoadingMore(false);
      setErrorMessage(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (isAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setErrorMessage(null);
    }

    try {
      const result = await searchOpenLibrary(
        trimmed,
        10,
        offset,
        abortControllerRef.current.signal
      );

      if (isAppend) {
        setBooks((prev) => {
          const existingKeys = new Set(prev.map((b) => b.key));
          const fresh = result.books.filter((b) => !existingKeys.has(b.key));
          const combined = [...prev, ...fresh];
          if (combined.length >= result.numFound || fresh.length === 0) {
            setHasReachedEnd(true);
          }
          return combined;
        });
        setCurrentOffset(offset + result.books.length);
      } else {
        setBooks(result.books);
        setNumFound(result.numFound);
        setCurrentOffset(result.books.length);
        setHasReachedEnd(result.books.length >= result.numFound || result.books.length === 0);
      }
      setErrorMessage(null);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setErrorMessage(err.message || 'Gagal memuat katalog buku dari Open Library.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  // Pull to refresh gesture listeners (Touch for thumb gesture & Mouse support)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (activeDetailBook || activeTab !== 'home') return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
      startYRef.current = clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isPulling || isRefreshing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - startYRef.current;

    if (diff > 0 && scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
      // Elastic resistance formula
      const pull = Math.min(Math.pow(diff, 0.82) * 2.2, 95);
      setPullDistance(pull);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    setIsPulling(false);
    if (pullDistance > 55 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50);
      // Re-trigger search on current query
      executeSearch(searchQuery, 0, false);
    } else {
      setPullDistance(0);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(text);
      executeSearch(text, 0, false);
    }, 450);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    setBooks([]);
    setNumFound(0);
    setErrorMessage(null);
  };

  const handleCategoryClick = (catName: string, catQuery: string) => {
    setSelectedCategory(catName);
    setInputValue(catQuery);
    setSearchQuery(catQuery);
    executeSearch(catQuery, 0, false);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || hasReachedEnd || !searchQuery.trim()) return;
    executeSearch(searchQuery, currentOffset, true);
  };

  useEffect(() => {
    executeSearch('Design', 0, false);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[440px] h-[956px] min-h-[956px] bg-[#CBD0F8] sm:border-[8px] sm:border-[#202126] sm:rounded-[56px] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 select-none shadow-[0_30px_70px_rgba(0,0,0,0.35)] flex flex-col">
      {/* iPhone 17 Pro Max Dynamic Island & Top Status Bar */}
      <div className="sticky top-0 z-40 bg-[#CBD0F8]/95 backdrop-blur-md pt-3.5 pb-2 px-7 flex items-center justify-between shrink-0">
        <span className="text-[14px] font-extrabold tracking-tight text-slate-800">9:41</span>
        {/* Dynamic Island pill */}
        <div className="w-26 h-5.5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/70 border border-slate-700/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2 text-slate-800">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
          </svg>
          <div className="w-5.5 h-3 border border-slate-800 rounded-xs p-0.5 flex items-center">
            <div className="h-full w-full bg-slate-800 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Screen Router */}
      {activeDetailBook ? (
        /* Dedicated Detail Screen */
        <DetailScreen
          book={activeDetailBook}
          relatedBooks={books}
          isFavorite={isFavorite(activeDetailBook.key)}
          onToggleFavorite={toggleFavorite}
          onBack={() => setActiveDetailBook(null)}
          onSelectRelatedBook={(newBook) => setActiveDetailBook(newBook)}
        />
      ) : activeTab === 'favorite' ? (
        /* Dedicated Favorite Screen */
        <FavoriteScreen
          favoriteBooks={favoriteBooks}
          onSelectBook={(book) => setActiveDetailBook(book)}
          onRemoveFavorite={(bookKey) =>
            saveFavorites(favoriteBooks.filter((b) => b.key !== bookKey))
          }
          onExploreMore={() => setActiveTab('home')}
        />
      ) : (
        /* Home Catalog Screen with PULL TO REFRESH */
        <div
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          className="flex-1 overflow-y-auto pb-24 relative"
        >
          {/* Animated Thumb Pull-to-Refresh Indicator */}
          <div
            style={{
              height: `${pullDistance}px`,
              transition: isPulling ? 'none' : 'height 0.25s cubic-bezier(0.1, 0.9, 0.2, 1)',
            }}
            className="w-full flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-xs text-slate-800"
          >
            {pullDistance > 12 && (
              <div className="flex items-center space-x-2 py-1 px-3 bg-white/70 rounded-full shadow-xs border border-white/80">
                {isRefreshing ? (
                  <RotateCw className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <ArrowDown
                    style={{
                      transform: `rotate(${Math.min((pullDistance / 55) * 180, 180)}deg)`,
                      transition: 'transform 0.15s ease',
                    }}
                    className={`w-4 h-4 ${
                      pullDistance > 55 ? 'text-indigo-600' : 'text-slate-600'
                    }`}
                  />
                )}
                <span className="text-[11.5px] font-bold text-slate-800">
                  {isRefreshing
                    ? 'Memperbarui katalog...'
                    : pullDistance > 55
                    ? 'Lepaskan jempol untuk perbarui'
                    : 'Tarik ke bawah dengan jempol'}
                </span>
              </div>
            )}
          </div>

          {/* Header Streak Row */}
          <div className="px-6 pt-2 flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white/40 flex items-center justify-center shadow-xs">
                <Zap className="w-4.5 h-4.5 text-slate-900 fill-slate-900" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-slate-900 leading-tight">
                  Wow! 25 Days without a break
                </div>
                <div className="text-[12px] text-slate-700/80 font-medium">
                  You're ahead of 81% of readers
                </div>
              </div>
            </div>
          </div>

          {/* Big Bold Headline with Compact Number formatting */}
          <div className="px-6 mt-5">
            <h1 className="text-[36px] font-black leading-[1.08] tracking-tight text-slate-900">
              You Have {numFound > 0 ? formatCompactNumber(numFound) : '12'} New Books
              <br />
              <span className="font-extrabold">{selectedCategory || 'Design'}</span>
            </h1>
          </div>

          {/* Real-time Search Input with Debounce */}
          <div className="px-6 mt-4">
            <div className="relative flex items-center bg-white/85 backdrop-blur-md rounded-2xl shadow-xs border border-white/60 focus-within:bg-white transition-all">
              <Search className="w-4.5 h-4.5 text-slate-500 ml-4" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Cari judul buku, penulis, topik..."
                className="w-full py-3 pl-3 pr-10 text-[14px] font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 w-6 h-6 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Subheader Row: Category Name + < 16 books > with Compact Number */}
          <div className="px-6 mt-5 flex items-center justify-between text-slate-900">
            <span className="text-[17px] font-extrabold">{selectedCategory}</span>
            <div className="flex items-center text-[13px] font-bold text-slate-800">
              <ChevronLeft className="w-4 h-4 cursor-pointer hover:opacity-70" />
              <span className="mx-1.5">
                {numFound > 0 ? formatCompactNumber(numFound) : '16'} books
              </span>
              <ChevronRight className="w-4 h-4 cursor-pointer hover:opacity-70" />
            </div>
          </div>

          {/* Bookshelf Carousel with WARM BROWN WOODEN SHELF */}
          <div className="relative mt-2 px-5 h-48 overflow-hidden">
            {/* Books row */}
            <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-28 h-40 shrink-0 rounded-xl bg-white/45 animate-pulse"
                  />
                ))
              ) : books.length > 0 ? (
                books.slice(0, 8).map((book) => (
                  <div
                    key={`shelf_${book.key}`}
                    onClick={() => setActiveDetailBook(book)}
                    className="w-28 h-40 shrink-0 rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.25)] cursor-pointer transform hover:-translate-y-2 transition duration-200 group relative bg-slate-800"
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {/* Fallback spine/cover if no image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2 pointer-events-none">
                      <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow-md">
                        {book.title}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-10 text-center text-[13px] text-slate-700 font-medium">
                  Tidak ada buku di rak untuk kategori ini.
                </div>
              )}
            </div>

            {/* WARM BROWN WOODEN SHELF BAR */}
            <div className="absolute bottom-1 left-5 right-5 h-8 rounded-xl bg-gradient-to-r from-[#4A2D17] via-[#6A4122] to-[#4A2D17] border-t-2 border-[#8E5B32] shadow-[0_6px_16px_rgba(40,20,10,0.4)] flex items-center justify-between px-3 pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-xs border border-amber-300 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-amber-800/80 rounded-full rotate-45"></div>
              </div>
              <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-amber-100/90 drop-shadow-xs">
                OPEN LIBRARY SHELF
              </div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-xs border border-amber-300 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-amber-800/80 rounded-full rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Category Pills: All 23, Design 10, Fantasy 5, etc. */}
          <div className="px-6 mt-3.5 flex items-center space-x-2.5 overflow-x-auto scrollbar-none py-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name, cat.query)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-[13.5px] font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white/65 text-slate-800 hover:bg-white/85'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-slate-900/10 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* White Curved Bottom Container */}
          <div className="mt-5 bg-white rounded-t-[38px] p-6 shadow-xl border-t border-slate-100">
            {/* Collections Section */}
            <div className="flex items-start justify-between pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[12px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Collections
                  </span>
                  <span className="text-[12px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Books
                  </span>
                </div>
                <h3 className="text-[22px] font-black text-slate-900 mt-2.5 leading-tight">
                  Autumn Reads
                </h3>
                <p className="text-[14px] text-slate-400 font-medium">
                  The Most Popular Books
                </p>
                <div className="mt-4 flex items-baseline space-x-1.5">
                  <span className="text-[48px] font-black text-slate-900 tracking-tight leading-none">
                    250
                  </span>
                  <span className="text-[14px] font-bold text-slate-400">Top</span>
                </div>
              </div>

              {/* 2x2 Mini Covers from current book list */}
              <div className="w-32 h-32 bg-slate-50 rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 shadow-inner shrink-0">
                {books.slice(0, 4).map((b, i) => (
                  <div
                    key={`mini_${b.key}_${i}`}
                    onClick={() => setActiveDetailBook(b)}
                    className="rounded-lg overflow-hidden bg-slate-200 cursor-pointer relative hover:opacity-90 transition"
                  >
                    {b.coverUrl ? (
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        OL
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Results Header with Compact Number format */}
            <div className="mt-5 flex items-center justify-between">
              <div className="text-[16px] font-black text-slate-900 flex items-center space-x-2">
                <span>
                  {searchQuery ? `Hasil: "${searchQuery}"` : 'Katalog Buku'}
                </span>
                {numFound > 0 && (
                  <span className="text-[12px] text-slate-400 font-bold">
                    ({books.length} dari {formatCompactNumber(numFound)})
                  </span>
                )}
              </div>
              {isLoading && (
                <div className="flex items-center space-x-1.5 text-[12px] text-indigo-600 font-bold">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memuat...</span>
                </div>
              )}
            </div>

            {/* Book Results Grid */}
            <div className="mt-4">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 p-2.5 space-y-2.5">
                      <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-md w-4/5 animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded-md w-3/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : errorMessage && books.length === 0 ? (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5 text-center my-4">
                  <XCircle className="w-9 h-9 text-rose-500 mx-auto" />
                  <h4 className="text-[14px] font-bold text-slate-900 mt-2">
                    Gagal Memuat Buku
                  </h4>
                  <p className="text-[12px] text-rose-600 mt-1 leading-snug">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => executeSearch(searchQuery, 0, false)}
                    className="mt-3.5 px-5 py-2 bg-slate-900 text-white rounded-xl text-[13px] font-bold inline-flex items-center space-x-2 shadow-xs hover:bg-slate-800 transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Coba Lagi (Retry)</span>
                  </button>
                </div>
              ) : books.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-7 h-7" />
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-800 mt-3">
                    Tidak Ada Buku Ditemukan
                  </h4>
                  <p className="text-[12px] text-slate-400 mt-1">
                    Coba kata kunci lain seperti "Harry Potter", "Javascript", atau "Design".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {books.map((book) => (
                    <div
                      key={book.key}
                      onClick={() => setActiveDetailBook(book)}
                      className="group rounded-2xl border border-slate-100 bg-white p-2.5 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover Thumbnail with Rating overlay */}
                        <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          {!book.coverUrl && (
                            <div className="flex flex-col items-center text-slate-400">
                              <BookOpen className="w-7 h-7" />
                              <span className="text-[10px] mt-1 font-semibold">No Cover</span>
                            </div>
                          )}
                          {/* Rating Badge */}
                          {book.ratingsAverage !== undefined && (
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-amber-300 text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center space-x-1 shadow-xs">
                              <Star className="w-3 h-3 fill-amber-300" />
                              <span>{book.ratingsAverage}</span>
                            </div>
                          )}
                        </div>

                        {/* Book Meta */}
                        <div className="mt-2.5">
                          <h4 className="text-[13.5px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                            {book.title}
                          </h4>
                          <p className="text-[11.5px] text-slate-500 line-clamp-1 mt-1 font-medium">
                            {book.authorNames.length > 0
                              ? book.authorNames[0]
                              : 'Penulis Tidak Diketahui'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>{book.firstPublishYear ?? '-'}</span>
                        {book.editionCount ? (
                          <span>{formatCompactNumber(book.editionCount)} edisi</span>
                        ) : (
                          <span>1 edisi</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation Bar (Home & Favorite) */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-8 py-2.5 flex items-center justify-around shadow-[0_-8px_20px_rgba(0,0,0,0.06)] shrink-0">
        {/* Home Tab */}
        <button
          onClick={() => {
            setActiveDetailBook(null);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center space-y-1 transition ${
            activeTab === 'home' && !activeDetailBook
              ? 'text-slate-900 font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center transition ${
              activeTab === 'home' && !activeDetailBook
                ? 'bg-slate-900 text-white'
                : 'text-slate-500'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11.5px] tracking-tight">Beranda</span>
        </button>

        {/* Favorite Tab */}
        <button
          onClick={() => {
            setActiveDetailBook(null);
            setActiveTab('favorite');
          }}
          className={`flex flex-col items-center space-y-1 transition relative ${
            activeTab === 'favorite' && !activeDetailBook
              ? 'text-slate-900 font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center transition relative ${
              activeTab === 'favorite' && !activeDetailBook
                ? 'bg-slate-900 text-white'
                : 'text-slate-500'
            }`}
          >
            <Bookmark className="w-4.5 h-4.5" />
            {favoriteBooks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {favoriteBooks.length}
              </span>
            )}
          </div>
          <span className="text-[11.5px] tracking-tight">Favorit</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar at bottom */}
      <div className="bg-white/95 pb-2 pt-0.5 flex justify-center shrink-0">
        <div className="w-32 h-1 bg-slate-900/30 rounded-full"></div>
      </div>
    </div>
  );
};
