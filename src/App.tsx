import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  RotateCw,
  XCircle,
  Search,
  BookOpen,
  ArrowDownCircle,
  ExternalLink,
} from 'lucide-react';
import { Book } from './types';
import { searchOpenLibrary } from './services/openLibrary';
import { formatCompactNumber } from './utils/format';
import { Navbar } from './components/Navbar';
import { CategoryFilter, Category } from './components/CategoryFilter';
import { WoodenShelf } from './components/WoodenShelf';
import { BookCard } from './components/BookCard';
import { DetailScreen } from './components/DetailScreen';
import { FavoriteScreen } from './components/FavoriteScreen';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'favorites'>('catalog');
  const [activeDetailBook, setActiveDetailBook] = useState<Book | null>(null);

  // Favorites with localStorage persistence
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('dl_favorite_books');
      if (saved) return JSON.parse(saved);
    } catch (_) { }
    return INITIAL_FAVORITES;
  });

  const saveFavorites = (booksList: Book[]) => {
    setFavoriteBooks(booksList);
    try {
      localStorage.setItem('dl_favorite_books', JSON.stringify(booksList));
    } catch (_) { }
  };

  const toggleFavorite = (book: Book) => {
    const exists = favoriteBooks.some((b) => b.key === book.key);
    if (exists) {
      saveFavorites(favoriteBooks.filter((b) => b.key !== book.key));
    } else {
      saveFavorites([book, ...favoriteBooks]);
    }
  };

  const isFavorite = (bookKey: string) =>
    favoriteBooks.some((b) => b.key === bookKey);

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
        24,
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
        setHasReachedEnd(
          result.books.length >= result.numFound || result.books.length === 0
        );
      }
      setErrorMessage(null);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setErrorMessage(
        err.message || 'Gagal memuat katalog buku dari Open Library.'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setInputValue(text);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(text);
      executeSearch(text, 0, false);
    }, 450);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setSearchQuery('');
    setBooks([]);
    setNumFound(0);
    setErrorMessage(null);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.name);
    setInputValue(category.query);
    setSearchQuery(category.query);
    executeSearch(category.query, 0, false);
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
    <div className="min-h-screen bg-[#F0F3FB] text-[#1E2138] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Top Responsive Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={inputValue}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        favoritesCount={favoriteBooks.length}
      />

      {/* Main Content Area (Fully responsive container) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'catalog' ? (
          <div className="space-y-8">
            {/* Header Hero & Reading Streak Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                {/* Streak Badge */}
                <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-900 border border-amber-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Wow! 25 Hari Membaca Tanpa Putus</span>
                  <span className="text-amber-700 font-medium hidden sm:inline">
                    • Melampaui 81% pembaca lain
                  </span>
                </div>

                {/* Big Dynamic Headline */}
                <h1 className="text-2xl sm:text-4xl font-black text-[#1E2138] tracking-tight leading-tight">
                  Tersedia {numFound > 0 ? formatCompactNumber(numFound) : 'Banyak'} Pilihan Buku
                  <span className="text-indigo-600 block sm:inline sm:ml-2">
                    {selectedCategory}
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
                  Jelajahi jutaan katalog literatur publik dari arsip digital Open Library. Temukan referensi desain, sains, teknologi, hingga novel legendaris dunia.
                </p>
              </div>

              {/* Quick Stat Pill */}
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-black text-[#1E2138]">
                    {numFound > 0 ? formatCompactNumber(numFound) : '1,000+'}
                  </div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Total Hasil Terdata
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Wooden Shelf Component */}
            <WoodenShelf
              books={books}
              isLoading={isLoading}
              onSelectBook={setActiveDetailBook}
              categoryName={selectedCategory}
            />

            {/* Category Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Pilih Kategori Literasi
                </h2>
                <span className="text-xs text-slate-400 font-semibold">
                  Klik untuk mencari topik
                </span>
              </div>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            </div>

            {/* Catalog Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#1E2138]">
                    {searchQuery ? `Hasil: "${searchQuery}"` : 'Katalog Buku'}
                  </h2>
                  {numFound > 0 && (
                    <span className="text-xs sm:text-sm font-bold text-slate-400">
                      ({books.length} dari {formatCompactNumber(numFound)} buku)
                    </span>
                  )}
                </div>

                {isLoading && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memuat buku...</span>
                  </div>
                )}
              </div>

              {/* State 1: Error Display */}
              {errorMessage && books.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-rose-100 shadow-xs">
                  <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900">
                    Gagal Mengambil Data Buku
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => executeSearch(searchQuery, 0, false)}
                    className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center space-x-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Coba Lagi (Retry)</span>
                  </button>
                </div>
              ) : null}

              {/* State 2: Empty Results */}
              {!isLoading && !errorMessage && books.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tidak Ditemukan Buku yang Cocok
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    Coba gunakan kata kunci umum lainnya seperti "Design", "Programming", "Architecture", atau "Science".
                  </p>
                </div>
              ) : null}

              {/* State 3: Skeleton Loader during initial fetch */}
              {isLoading && books.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-3"
                    >
                      <div className="aspect-[2/3] bg-slate-100 rounded-xl animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded w-4/5 animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded w-3/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : null}

              {/* State 4: Responsive Book Grid */}
              {books.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {books.map((book) => (
                    <BookCard
                      key={book.key}
                      book={book}
                      isFavorite={isFavorite(book.key)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={setActiveDetailBook}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {books.length > 0 && !hasReachedEnd && (
                <div className="pt-6 pb-4 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Memuat halaman berikutnya...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="w-4 h-4 text-indigo-600" />
                        <span>Muat Lebih Banyak Buku</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Favorites Tab View */
          <FavoriteScreen
            favoriteBooks={favoriteBooks}
            onSelectBook={setActiveDetailBook}
            onToggleFavorite={toggleFavorite}
            onExploreMore={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* Modal Dialog for Book Details */}
      {activeDetailBook && (
        <DetailScreen
          book={activeDetailBook}
          relatedBooks={books}
          isFavorite={isFavorite(activeDetailBook.key)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setActiveDetailBook(null)}
          onSelectRelatedBook={(newBook) => setActiveDetailBook(newBook)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 sm:px-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#1E2138]">litera</span>
            <span>•</span>
            <span>Digital Library Explorer</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Data bersumber dari</span>
            <a
              href="https://openlibrary.org"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-indigo-600 hover:underline inline-flex items-center space-x-1"
            >
              <span>Internet Archive Open Library</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
