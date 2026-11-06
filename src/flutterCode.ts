export interface FlutterFile {
  id: string;
  filename: string;
  path: string;
  layer: string;
  description: string;
  code: string;
}

export const FLUTTER_FILES: FlutterFile[] = [
  {
    id: 'model',
    filename: 'book.dart',
    path: 'lib/data/models/book.dart',
    layer: '1. Layer Model',
    description: 'Model immutable yang merepresentasikan satu buku dari respons JSON Open Library API dengan factory constructor aman null.',
    code: `import 'package:flutter/foundation.dart';

/// Model immutable yang merepresentasikan data buku dari Open Library Search API.
///
/// Seluruh properti bersifat [final] dan memiliki constructor [const] untuk menjamin immutability.
@immutable
class Book {
  /// Identifier unik buku (contoh: "/works/OL82563W")
  final String key;

  /// Judul buku
  final String title;

  /// Daftar nama penulis (bersifat unmodifiable)
  final List<String> authorNames;

  /// Tahun pertama kali diterbitkan (nullable)
  final int? firstPublishYear;

  /// ID sampul buku pada Open Library Covers API (nullable)
  final int? coverId;

  /// Jumlah edisi yang tercatat (nullable)
  final int? editionCount;

  /// Ketersediaan teks lengkap (full-text)
  final bool hasFullText;

  /// Rating rata-rata buku (1.0 - 5.0, nullable)
  final double? ratingsAverage;

  /// Constructor konstan dengan seluruh properti
  const Book({
    required this.key,
    required this.title,
    required this.authorNames,
    this.firstPublishYear,
    this.coverId,
    this.editionCount,
    this.hasFullText = false,
    this.ratingsAverage,
  });

  /// Factory constructor untuk mem-parse JSON dari Open Library API.
  ///
  /// Dilengkapi validasi tipe data defensif agar tahan terhadap field null,
  /// tipe data yang tidak sesuai (misal num vs double), maupun field yang tidak ada.
  factory Book.fromJson(Map<String, dynamic> json) {
    // 1. Parsing key
    final rawKey = json['key'];
    final key = rawKey is String && rawKey.trim().isNotEmpty
        ? rawKey.trim()
        : '';

    // 2. Parsing title
    final rawTitle = json['title'];
    final title = rawTitle is String && rawTitle.trim().isNotEmpty
        ? rawTitle.trim()
        : 'Tanpa Judul';

    // 3. Parsing author_name secara aman dan unmodifiable
    List<String> parsedAuthors = const <String>[];
    final rawAuthors = json['author_name'];
    if (rawAuthors is List) {
      final validAuthors = rawAuthors
          .where((item) => item != null)
          .map((item) => item.toString().trim())
          .where((item) => item.isNotEmpty)
          .toList(growable: false);
      parsedAuthors = List<String>.unmodifiable(validAuthors);
    }

    // 4. Parsing first_publish_year
    int? parsedYear;
    final rawYear = json['first_publish_year'];
    if (rawYear is num) {
      parsedYear = rawYear.toInt();
    } else if (rawYear is String) {
      parsedYear = int.tryParse(rawYear);
    }

    // 5. Parsing cover_i
    int? parsedCoverId;
    final rawCover = json['cover_i'];
    if (rawCover is num) {
      parsedCoverId = rawCover.toInt();
    } else if (rawCover is String) {
      parsedCoverId = int.tryParse(rawCover);
    }

    // 6. Parsing edition_count
    int? parsedEditionCount;
    final rawEditions = json['edition_count'];
    if (rawEditions is num) {
      parsedEditionCount = rawEditions.toInt();
    } else if (rawEditions is String) {
      parsedEditionCount = int.tryParse(rawEditions);
    }

    // 7. Parsing has_fulltext
    final rawFullText = json['has_fulltext'];
    final bool parsedHasFullText = rawFullText == true;

    // 8. Parsing ratings_average (API dapat mengirim int, num, atau double)
    double? parsedRating;
    final rawRating = json['ratings_average'];
    if (rawRating is num) {
      parsedRating = double.parse(rawRating.toStringAsFixed(2));
    }

    return Book(
      key: key,
      title: title,
      authorNames: parsedAuthors,
      firstPublishYear: parsedYear,
      coverId: parsedCoverId,
      editionCount: parsedEditionCount,
      hasFullText: parsedHasFullText,
      ratingsAverage: parsedRating,
    );
  }

  /// Getter untuk menghasilkan URL sampul dari Open Library Covers API.
  ///
  /// Mengembalikan [null] jika [coverId] tidak tersedia atau <= 0.
  /// Menggunakan ukuran medium (-M.jpg).
  String? get coverUrl {
    if (coverId == null || coverId! <= 0) {
      return null;
    }
    return 'https://covers.openlibrary.org/b/id/$coverId-M.jpg';
  }

  /// Mengonversi model Book kembali ke format Map JSON
  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'title': title,
      'author_name': authorNames,
      if (firstPublishYear != null) 'first_publish_year': firstPublishYear,
      if (coverId != null) 'cover_i': coverId,
      if (editionCount != null) 'edition_count': editionCount,
      'has_fulltext': hasFullText,
      if (ratingsAverage != null) 'ratings_average': ratingsAverage,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Book &&
          runtimeType == other.runtimeType &&
          key == other.key &&
          title == other.title;

  @override
  int get hashCode => key.hashCode ^ title.hashCode;
}
`,
  },
  {
    id: 'service',
    filename: 'book_service.dart',
    path: 'lib/data/services/book_service.dart',
    layer: '2. Layer Service',
    description: 'Service HTTP yang berkomunikasi langsung dengan Open Library Search API dengan exception handling yang informatif dan dependency injection HTTP client.',
    code: `import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/book.dart';

/// Exception khusus untuk kegagalan pada layer BookService
class BookServiceException implements Exception {
  final String message;
  final int? statusCode;

  const BookServiceException(this.message, [this.statusCode]);

  @override
  String toString() =>
      'BookServiceException: $message \${statusCode != null ? "(Status: $statusCode)" : ""}';
}

/// Hasil pencarian yang membungkus daftar buku dan metadata pagination dari Open Library API.
class BookSearchResult {
  final List<Book> books;
  final int numFound;
  final int start;

  const BookSearchResult({
    required this.books,
    required this.numFound,
    required this.start,
  });

  factory BookSearchResult.empty() => const BookSearchResult(
        books: [],
        numFound: 0,
        start: 0,
      );
}

/// Service untuk mengambil data katalog buku dari Open Library Search API.
class BookService {
  final http.Client _client;

  /// Dependency injection HTTP client agar service mudah diuji (unit testing & mock)
  BookService({http.Client? client}) : _client = client ?? http.Client();

  /// Mencari buku berdasarkan [query] dengan parameter [limit] dan [start] (offset).
  ///
  /// Jika [query] kosong atau hanya spasi, method langsung mengembalikan [BookSearchResult.empty()]
  /// tanpa mengirim request jaringan sama sekali.
  Future<BookSearchResult> searchBooks({
    required String query,
    int limit = 10,
    int start = 0,
  }) async {
    final trimmedQuery = query.trim();
    if (trimmedQuery.isEmpty) {
      return BookSearchResult.empty();
    }

    // Membangun URI yang aman dengan query parameters
    final Map<String, String> queryParameters = {
      'q': trimmedQuery,
      'limit': limit.toString(),
      if (start > 0) 'offset': start.toString(),
      // Mengoptimalkan bandwidth dengan hanya meminta field yang dibutuhkan UI
      'fields':
          'key,title,author_name,first_publish_year,cover_i,edition_count,has_fulltext,ratings_average',
    };

    final uri = Uri.https(
      'openlibrary.org',
      '/search.json',
      queryParameters,
    );

    try {
      final response = await _client.get(
        uri,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DigitalLibraryExplorer/1.0 (Flutter Riverpod App)',
        },
      ).timeout(
        const Duration(seconds: 12),
        onTimeout: () {
          throw const BookServiceException(
            'Koneksi waktu habis (Timeout). Periksa koneksi internet Anda.',
          );
        },
      );

      // Verifikasi status code HTTP
      if (response.statusCode != 200) {
        throw BookServiceException(
          'Server Open Library merespons dengan kesalahan status.',
          response.statusCode,
        );
      }

      // Verifikasi dan decoding format JSON
      final dynamic decodedJson = jsonDecode(response.body);
      if (decodedJson is! Map<String, dynamic>) {
        throw const BookServiceException(
          'Format respons API tidak valid: Diharapkan JSON Object.',
        );
      }

      final rawDocs = decodedJson['docs'];
      if (rawDocs is! List) {
        throw const BookServiceException(
          'Properti "docs" pada respons API tidak berupa List.',
        );
      }

      // Mapping setiap elemen docs menjadi instance Book yang aman
      final books = rawDocs
          .whereType<Map<String, dynamic>>()
          .map((doc) => Book.fromJson(doc))
          .toList(growable: false);

      final int numFound = decodedJson['numFound'] is num
          ? (decodedJson['numFound'] as num).toInt()
          : books.length;

      final int parsedStart = decodedJson['start'] is num
          ? (decodedJson['start'] as num).toInt()
          : start;

      return BookSearchResult(
        books: books,
        numFound: numFound,
        start: parsedStart,
      );
    } on SocketException catch (_) {
      throw const BookServiceException(
        'Tidak dapat terhubung ke internet. Periksa koneksi data atau Wi-Fi Anda.',
      );
    } on http.ClientException catch (e) {
      throw BookServiceException(
        'Terjadi kesalahan komunikasi jaringan: \${e.message}',
      );
    } on FormatException catch (_) {
      throw const BookServiceException(
        'Gagal memproses data JSON yang diterima dari server.',
      );
    } catch (e) {
      if (e is BookServiceException) rethrow;
      throw BookServiceException('Terjadi kesalahan yang tidak terduga: $e');
    }
  }
}
`,
  },
  {
    id: 'repository',
    filename: 'book_repository.dart',
    path: 'lib/data/repositories/book_repository.dart',
    layer: '3. Layer Repository',
    description: 'Abstraksi akses data yang menjembatani Riverpod Provider dengan BookService, memisahkan logika bisnis dari protokol HTTP.',
    code: `import '../models/book.dart';
import '../services/book_service.dart';

/// Repository untuk mengelola akses data katalog buku.
///
/// Bertindak sebagai Single Source of Truth bagi Riverpod Provider,
/// memisahkan detail implementasi HTTP Service dari konsumsi UI.
class BookRepository {
  final BookService _bookService;

  /// Dependency injection menerima [BookService]
  const BookRepository({required BookService service}) : _bookService = service;

  /// Melakukan pencarian buku berdasarkan kata kunci.
  ///
  /// Meneruskan parameter [query], [limit], dan [start] ke service
  /// serta mempertahankan exception agar dapat ditangani oleh AsyncValue di UI.
  Future<BookSearchResult> searchBooks({
    required String query,
    int limit = 10,
    int start = 0,
  }) async {
    return await _bookService.searchBooks(
      query: query,
      limit: limit,
      start: start,
    );
  }
}
`,
  },
  {
    id: 'provider',
    filename: 'book_provider.dart',
    path: 'lib/providers/book_provider.dart',
    layer: '4. Layer Provider',
    description: 'Riverpod 2.x standard tanpa build_runner. Mengatur DI HTTP client, service, repository, filter kategori, dan StateNotifier pencarian dengan pagination & debounce.',
    code: `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../data/models/book.dart';
import '../data/repositories/book_repository.dart';
import '../data/services/book_service.dart';

// ==========================================
// 1. Dependency Injection Providers
// ==========================================

/// Provider untuk HTTP Client dengan lifecycle aman (otomatis close saat dispose)
final httpClientProvider = Provider<http.Client>((ref) {
  final client = http.Client();
  ref.onDispose(() {
    client.close();
  });
  return client;
});

/// Provider untuk BookService dengan HTTP Client terinjeksi
final bookServiceProvider = Provider<BookService>((ref) {
  final client = ref.watch(httpClientProvider);
  return BookService(client: client);
});

/// Provider untuk BookRepository dengan BookService terinjeksi
final bookRepositoryProvider = Provider<BookRepository>((ref) {
  final service = ref.watch(bookServiceProvider);
  return BookRepository(service: service);
});

// ==========================================
// 2. Query & Category State Providers
// ==========================================

/// Menyimpan query pencarian aktif
final searchQueryProvider = StateProvider<String>((ref) => 'Design');

/// Menyimpan kategori yang sedang dipilih pada chip/pill UI
final selectedCategoryProvider = StateProvider<String>((ref) => 'Design');

// ==========================================
// 3. State Model untuk Search & Pagination
// ==========================================

class BookSearchState {
  final List<Book> books;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;
  final int totalCount;
  final int currentOffset;
  final bool hasReachedEnd;

  const BookSearchState({
    required this.books,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.totalCount = 0,
    this.currentOffset = 0,
    this.hasReachedEnd = false,
  });

  factory BookSearchState.initial() => const BookSearchState(
        books: [],
        isLoading: false,
      );

  BookSearchState copyWith({
    List<Book>? books,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    bool clearError = false,
    int? totalCount,
    int? currentOffset,
    bool? hasReachedEnd,
  }) {
    return BookSearchState(
      books: books ?? this.books,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      totalCount: totalCount ?? this.totalCount,
      currentOffset: currentOffset ?? this.currentOffset,
      hasReachedEnd: hasReachedEnd ?? this.hasReachedEnd,
    );
  }
}

// ==========================================
// 4. StateNotifier untuk Search & Load More
// ==========================================

class BookSearchNotifier extends StateNotifier<BookSearchState> {
  final BookRepository _repository;
  String _activeQuery = '';
  static const int _pageSize = 10;

  BookSearchNotifier(this._repository) : super(BookSearchState.initial());

  /// Memulai pencarian baru untuk [query]
  Future<void> search(String query) async {
    final trimmed = query.trim();
    _activeQuery = trimmed;

    if (trimmed.isEmpty) {
      state = BookSearchState.initial();
      return;
    }

    state = state.copyWith(
      isLoading: true,
      clearError: true,
      currentOffset: 0,
      hasReachedEnd: false,
    );

    try {
      final result = await _repository.searchBooks(
        query: trimmed,
        limit: _pageSize,
        start: 0,
      );

      // Pastikan request lama tidak menimpa query yang lebih baru
      if (_activeQuery != trimmed) return;

      state = state.copyWith(
        books: result.books,
        isLoading: false,
        totalCount: result.numFound,
        currentOffset: result.books.length,
        hasReachedEnd: result.books.length >= result.numFound || result.books.isEmpty,
      );
    } catch (e) {
      if (_activeQuery != trimmed) return;
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('BookServiceException: ', ''),
      );
    }
  }

  /// Memuat halaman berikutnya (Pagination / Load More)
  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore || state.hasReachedEnd || _activeQuery.isEmpty) {
      return;
    }

    state = state.copyWith(isLoadingMore: true, clearError: true);

    try {
      final nextOffset = state.currentOffset;
      final result = await _repository.searchBooks(
        query: _activeQuery,
        limit: _pageSize,
        start: nextOffset,
      );

      // Mencegah duplikasi item dengan menyaring berdasarkan key unik
      final existingKeys = state.books.map((b) => b.key).toSet();
      final newBooks = result.books.where((b) => !existingKeys.contains(b.key)).toList();

      final combined = [...state.books, ...newBooks];

      state = state.copyWith(
        books: combined,
        isLoadingMore: false,
        currentOffset: nextOffset + result.books.length,
        hasReachedEnd: combined.length >= result.numFound || result.books.isEmpty,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString().replaceFirst('BookServiceException: ', ''),
      );
    }
  }

  /// Mengulang request terakhir (Retry)
  void retry() {
    if (_activeQuery.isNotEmpty) {
      search(_activeQuery);
    }
  }
}

/// Provider StateNotifier untuk manajemen pencarian dan pagination katalog buku
final bookSearchNotifierProvider =
    StateNotifierProvider.autoDispose<BookSearchNotifier, BookSearchState>((ref) {
  final repository = ref.watch(bookRepositoryProvider);
  final notifier = BookSearchNotifier(repository);
  
  // Inisialisasi awal dengan query default ('Design')
  final initialQuery = ref.read(searchQueryProvider);
  if (initialQuery.isNotEmpty) {
    notifier.search(initialQuery);
  }

  return notifier;
});
`,
  },
  {
    id: 'widget',
    filename: 'book_explorer_widget.dart',
    path: 'lib/ui/widgets/book_explorer_widget.dart',
    layer: '5. Layer UI Widget',
    description: 'Widget UI utama ConsumerStatefulWidget dengan palet warna Lavender/Periwinkle, rak buku kaca frosted, carousel, pencarian real-time debounce, bottom sheet detail, dan pagination.',
    code: `import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/book.dart';
import '../../providers/book_provider.dart';

/// Tema warna kustom yang diselaraskan dengan referensi desain Digital Library Explorer
class LibraryColors {
  static const Color background = Color(0xFFC7CEF9); // Soft Lavender / Periwinkle
  static const Color headerText = Color(0xFF1E2138); // Deep Navy Black
  static const Color secondaryText = Color(0xFF6E7494);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color pillActive = Color(0xFF1E2138);
  static const Color pillInactive = Color(0xFFE4E7FA);
  static const Color shelfGlass = Color(0x33FFFFFF);
  static const Color accentOrange = Color(0xFFF3754E);
  static const Color accentYellow = Color(0xFFF4C443);
  static const Color error = Color(0xFFBA1A1A);
}

/// Widget utama Digital Library Explorer
class BookExplorerWidget extends ConsumerStatefulWidget {
  const BookExplorerWidget({super.key});

  @override
  ConsumerState<BookExplorerWidget> createState() => _BookExplorerWidgetState();
}

class _BookExplorerWidgetState extends ConsumerState<BookExplorerWidget> {
  late final TextEditingController _searchController;
  Timer? _debounceTimer;

  // Daftar kategori dengan label dan query pencarian
  final List<Map<String, String>> _categories = const [
    {'name': 'All', 'query': 'bestseller', 'count': '23'},
    {'name': 'Design', 'query': 'Design', 'count': '10'},
    {'name': 'Fantasy', 'query': 'Fantasy', 'count': '5'},
    {'name': 'Mystery', 'query': 'Mystery', 'count': '8'},
    {'name': 'Science', 'query': 'Science', 'count': '12'},
  ];

  @override
  void initState() {
    super.initState();
    final currentQuery = ref.read(searchQueryProvider);
    _searchController = TextEditingController(text: currentQuery);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  /// Menangani perubahan teks dengan Debounce 450 milidetik
  void _onSearchChanged(String text) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 450), () {
      ref.read(searchQueryProvider.notifier).state = text;
      ref.read(bookSearchNotifierProvider.notifier).search(text);
    });
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchQueryProvider.notifier).state = '';
    ref.read(bookSearchNotifierProvider.notifier).search('');
  }

  void _onCategorySelected(String name, String query) {
    ref.read(selectedCategoryProvider.notifier).state = name;
    _searchController.text = query;
    ref.read(searchQueryProvider.notifier).state = query;
    ref.read(bookSearchNotifierProvider.notifier).search(query);
  }

  void _showBookDetail(BuildContext context, Book book) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _BookDetailBottomSheet(book: book),
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(bookSearchNotifierProvider);
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final currentQuery = ref.watch(searchQueryProvider);

    return Scaffold(
      backgroundColor: LibraryColors.background,
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // 1. Header & Status
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top row: Streak indicator & Menu
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.35),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.bolt_rounded,
                            size: 18,
                            color: LibraryColors.headerText,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Wow! 25 Days without a break',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  color: LibraryColors.headerText,
                                ),
                              ),
                              Text(
                                "You're ahead of 81% of readers",
                                style: TextStyle(
                                  fontSize: 11,
                                  color: LibraryColors.headerText.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () {},
                          icon: const Icon(Icons.more_horiz_rounded),
                          color: LibraryColors.headerText,
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Big Typography Headline (Matches Design Mockup)
                    Text(
                      'You Have \${searchState.totalCount > 0 ? searchState.totalCount : "12"} New Books\\n\${selectedCategory.isNotEmpty ? selectedCategory : "Design"}',
                      style: const TextStyle(
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -1.2,
                        height: 1.1,
                        color: LibraryColors.headerText,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Search Bar with Debounce
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        style: const TextStyle(
                          color: LibraryColors.headerText,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Cari judul, penulis, atau kata kunci...',
                          hintStyle: TextStyle(
                            color: LibraryColors.secondaryText.withOpacity(0.8),
                            fontSize: 13,
                          ),
                          prefixIcon: const Icon(
                            Icons.search_rounded,
                            color: LibraryColors.headerText,
                          ),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear_rounded, size: 18),
                                  onPressed: _clearSearch,
                                )
                              : null,
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Shelf Subheader row: Category title & Counter "< 16 books >"
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          selectedCategory,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: LibraryColors.headerText,
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.chevron_left_rounded, size: 16),
                            Text(
                              ' \${searchState.totalCount} books ',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: LibraryColors.headerText,
                              ),
                            ),
                            const Icon(Icons.chevron_right_rounded, size: 16),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),

            // 2. Interactive Frosted Glass Bookshelf Carousel
            SliverToBoxAdapter(
              child: _BookshelfCarousel(
                books: searchState.books,
                isLoading: searchState.isLoading,
                onBookTap: (book) => _showBookDetail(context, book),
              ),
            ),

            // 3. Category Filter Pills: All (23), Design (10), Fantasy (5), ...
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    itemCount: _categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = selectedCategory == cat['name'];
                      return InkWell(
                        onTap: () => _onCategorySelected(cat['name']!, cat['query']!),
                        borderRadius: BorderRadius.circular(20),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? LibraryColors.pillActive
                                : Colors.white.withOpacity(0.55),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Text(
                                cat['name']!,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected
                                      ? Colors.white
                                      : LibraryColors.headerText,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? Colors.white.withOpacity(0.2)
                                      : Colors.black.withOpacity(0.06),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  cat['count']!,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected
                                        ? Colors.white
                                        : LibraryColors.headerText,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            // 4. White Bottom Curved Container Card (Collections & Grid Results)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.only(top: 8),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x12000000),
                      blurRadius: 16,
                      offset: Offset(0, -6),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Collections Banner Section (Matches Mockup)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    _buildSmallBadge('Collections'),
                                    const SizedBox(width: 6),
                                    _buildSmallBadge('Books'),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                const Text(
                                  'Autumn Reads',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: LibraryColors.headerText,
                                  ),
                                ),
                                const Text(
                                  'The Most Popular Books',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: LibraryColors.secondaryText,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: const [
                                    Text(
                                      '250',
                                      style: TextStyle(
                                        fontSize: 48,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: -2,
                                        height: 0.9,
                                        color: LibraryColors.headerText,
                                      ),
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      'Top',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: LibraryColors.secondaryText,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          // 2x2 Mini Book Cover Matrix (Mockup visual)
                          _buildMiniCoverGrid(searchState.books),
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Divider(height: 1, color: Color(0xFFEEEEEE)),
                      const SizedBox(height: 20),

                      // Section Title for Search Results
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            currentQuery.trim().isEmpty
                                ? 'Koleksi Rekomendasi'
                                : 'Hasil untuk "\$currentQuery"',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: LibraryColors.headerText,
                            ),
                          ),
                          if (searchState.totalCount > 0)
                            Text(
                              '\${searchState.books.length} dari \${searchState.totalCount}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: LibraryColors.secondaryText,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Handling Loading, Error, Empty, and Data States
                      _buildContentState(
                        context,
                        searchState,
                        onRetry: () =>
                            ref.read(bookSearchNotifierProvider.notifier).retry(),
                        onLoadMore: () => ref
                            .read(bookSearchNotifierProvider.notifier)
                            .loadMore(),
                        onBookTap: (book) => _showBookDetail(context, book),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F3FA),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: LibraryColors.secondaryText,
        ),
      ),
    );
  }

  Widget _buildMiniCoverGrid(List<Book> books) {
    return Container(
      width: 130,
      height: 130,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF6F7FD),
        borderRadius: BorderRadius.circular(18),
      ),
      child: GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 4,
        mainAxisSpacing: 4,
        physics: const NeverScrollableScrollPhysics(),
        children: List.generate(4, (index) {
          final book = books.length > index ? books[index] : null;
          return ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: book?.coverUrl != null
                ? Image.network(
                    book!.coverUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _placeholderBox(index),
                  )
                : _placeholderBox(index),
          );
        }),
      ),
    );
  }

  Widget _placeholderBox(int index) {
    final colors = [
      const Color(0xFFE2C96C),
      const Color(0xFFE75C5C),
      const Color(0xFF86A873),
      const Color(0xFF5B98D2),
    ];
    return Container(
      color: colors[index % colors.length],
      child: const Center(
        child: Icon(Icons.menu_book_rounded, color: Colors.white, size: 16),
      ),
    );
  }

  Widget _buildContentState(
    BuildContext context,
    BookSearchState state, {
    required VoidCallback onRetry,
    required VoidCallback onLoadMore,
    required Function(Book) onBookTap,
  }) {
    // 1. Initial Loading State (Shimmer Skeleton Cards)
    if (state.isLoading) {
      return const _BookSkeletonList();
    }

    // 2. Error State with Retry Button
    if (state.errorMessage != null && state.books.isEmpty) {
      return _ErrorStateView(
        errorMessage: state.errorMessage!,
        onRetry: onRetry,
      );
    }

    // 3. Empty State (Query tidak menghasilkan buku)
    if (state.books.isEmpty) {
      return const _EmptyStateView();
    }

    // 4. Data State with Responsive Grid and Pagination Button
    return Column(
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            // Responsif: 1 kolom di mobile sempit, 2 kolom di tablet/layar lebar
            final crossAxisCount = constraints.maxWidth > 580 ? 3 : 2;
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: state.books.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 14,
                mainAxisSpacing: 16,
                childAspectRatio: 0.62,
              ),
              itemBuilder: (context, index) {
                final book = state.books[index];
                return _BookCard(
                  book: book,
                  onTap: () => onBookTap(book),
                );
              },
            );
          },
        ),
        const SizedBox(height: 20),

        // Pagination "Load More" Button
        if (!state.hasReachedEnd)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: state.isLoadingMore ? null : onLoadMore,
                style: ElevatedButton.styleFrom(
                  backgroundColor: LibraryColors.pillActive,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: state.isLoadingMore
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.expand_more_rounded, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Muat Lebih Banyak (Load More)',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          )
        else if (state.books.isNotEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Text(
              'Seluruh buku telah dimuat.',
              style: TextStyle(
                fontSize: 12,
                color: LibraryColors.secondaryText,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
      ],
    );
  }
}

/// Widget Rak Buku Kaca Frosted (Bookshelf Glass Carousel)
class _BookshelfCarousel extends StatelessWidget {
  final List<Book> books;
  final bool isLoading;
  final Function(Book) onBookTap;

  const _BookshelfCarousel({
    required this.books,
    required this.isLoading,
    required this.onBookTap,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return SizedBox(
        height: 180,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          scrollDirection: Axis.horizontal,
          itemCount: 4,
          separatorBuilder: (_, __) => const SizedBox(width: 14),
          itemBuilder: (_, __) => Container(
            width: 110,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.4),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      );
    }

    final displayBooks = books.take(8).toList();
    if (displayBooks.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 200,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          // Horizontal Book List
          Positioned.fill(
            bottom: 12,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: displayBooks.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final book = displayBooks[index];
                return GestureDetector(
                  onTap: () => onBookTap(book),
                  child: Hero(
                    tag: 'shelf_\${book.key}',
                    child: Container(
                      width: 115,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.18),
                            blurRadius: 10,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: book.coverUrl != null
                            ? Image.network(
                                book.coverUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _coverFallback(book),
                              )
                            : _coverFallback(book),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Translucent Glass Shelf with Metallic Bolt Pins (Matches Minchukova's design)
          Positioned(
            left: 16,
            right: 16,
            bottom: 0,
            height: 38,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.32),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.55),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: _metallicPin(),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _metallicPin(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _metallicPin() {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const RadialGradient(
          colors: [Colors.white, Color(0xFFB0B0B0)],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
    );
  }

  Widget _coverFallback(Book book) {
    return Container(
      color: const Color(0xFF2E344A),
      padding: const EdgeInsets.all(8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.book, color: Colors.white70, size: 24),
          const SizedBox(height: 6),
          Text(
            book.title,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

/// Kartu Buku Modern untuk Tampilan Grid
class _BookCard extends StatelessWidget {
  final Book book;
  final VoidCallback onTap;

  const _BookCard({required this.book, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF0F1F6), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover Image with Loading & Error Builder
            Expanded(
              flex: 12,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(15)),
                      child: book.coverUrl != null
                          ? Image.network(
                              book.coverUrl!,
                              fit: BoxFit.cover,
                              loadingBuilder: (context, child, progress) {
                                if (progress == null) return child;
                                return Container(
                                  color: const Color(0xFFF1F3FA),
                                  child: const Center(
                                    child: SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: LibraryColors.pillActive,
                                      ),
                                    ),
                                  ),
                                );
                              },
                              errorBuilder: (_, __, ___) => _buildPlaceholder(),
                            )
                          : _buildPlaceholder(),
                    ),
                  ),
                  // Rating Badge (Hanya tampil jika ada data rating asli dari API)
                  if (book.ratingsAverage != null)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.75),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star_rounded,
                              size: 13,
                              color: LibraryColors.accentYellow,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              book.ratingsAverage!.toStringAsFixed(1),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Metadata: Judul, Penulis, Tahun, Edisi
            Expanded(
              flex: 8,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          book.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: LibraryColors.headerText,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          book.authorNames.isNotEmpty
                              ? book.authorNames.first
                              : 'Penulis Tidak Diketahui',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            color: LibraryColors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (book.firstPublishYear != null)
                          Text(
                            '\${book.firstPublishYear}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: LibraryColors.secondaryText,
                            ),
                          ),
                        if (book.editionCount != null)
                          Text(
                            '\${book.editionCount} edisi',
                            style: const TextStyle(
                              fontSize: 10,
                              color: LibraryColors.secondaryText,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: const Color(0xFFF1F3FA),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.book_outlined,
              size: 28,
              color: LibraryColors.secondaryText.withOpacity(0.5),
            ),
            const SizedBox(height: 4),
            Text(
              'No Cover',
              style: TextStyle(
                fontSize: 10,
                color: LibraryColors.secondaryText.withOpacity(0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Modal Bottom Sheet untuk Detail Informasi Buku
class _BookDetailBottomSheet extends StatelessWidget {
  final Book book;

  const _BookDetailBottomSheet({required this.book});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Header Row: Cover & Main Meta
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  width: 90,
                  height: 130,
                  child: book.coverUrl != null
                      ? Image.network(
                          book.coverUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: Colors.grey.shade200,
                            child: const Icon(Icons.broken_image),
                          ),
                        )
                      : Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.book),
                        ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      book.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: LibraryColors.headerText,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      book.authorNames.isNotEmpty
                          ? book.authorNames.join(', ')
                          : 'Penulis Tidak Diketahui',
                      style: const TextStyle(
                        fontSize: 13,
                        color: LibraryColors.secondaryText,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (book.ratingsAverage != null)
                      Row(
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            size: 18,
                            color: Colors.amber,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '\${book.ratingsAverage} / 5.0 (Rating Asli)',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: LibraryColors.headerText,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),

          // Detail Badges & Stats
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (book.firstPublishYear != null)
                _metaChip(
                  Icons.calendar_today_rounded,
                  'Tahun Terbit',
                  '\${book.firstPublishYear}',
                ),
              if (book.editionCount != null)
                _metaChip(
                  Icons.auto_stories_rounded,
                  'Edisi',
                  '\${book.editionCount} edisi tercatat',
                ),
              _metaChip(
                Icons.menu_book_rounded,
                'Full Text',
                book.hasFullText ? 'Tersedia' : 'Tidak Tersedia',
              ),
              _metaChip(
                Icons.vpn_key_rounded,
                'Identifier Key',
                book.key,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Close button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: LibraryColors.pillActive,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: const Text('Tutup Detail'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _metaChip(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF6F7FD),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: LibraryColors.secondaryText),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 10, color: LibraryColors.secondaryText),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: LibraryColors.headerText,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Shimmer Skeleton Loading View
class _BookSkeletonList extends StatelessWidget {
  const _BookSkeletonList();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 4,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 16,
        childAspectRatio: 0.62,
      ),
      itemBuilder: (_, __) => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF1F3FA),
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

/// Error State dengan Tombol Retry
class _ErrorStateView extends StatelessWidget {
  final String errorMessage;
  final VoidCallback onRetry;

  const _ErrorStateView({required this.errorMessage, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF0F0),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.wifi_off_rounded,
            size: 40,
            color: LibraryColors.error,
          ),
          const SizedBox(height: 12),
          const Text(
            'Gagal Memuat Katalog Buku',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: LibraryColors.headerText,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            errorMessage,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              color: LibraryColors.secondaryText,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Coba Lagi (Retry)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: LibraryColors.pillActive,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Empty State ketika pencarian tidak menemukan hasil
class _EmptyStateView extends StatelessWidget {
  const _EmptyStateView();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      child: Center(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F3FA),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off_rounded,
                size: 36,
                color: LibraryColors.secondaryText,
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Buku Tidak Ditemukan',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: LibraryColors.headerText,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Coba cari dengan kata kunci lain seperti "Harry Potter", "Flutter", atau "Design".',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: LibraryColors.secondaryText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    id: 'pubspec',
    filename: 'pubspec.yaml',
    path: 'pubspec.yaml',
    layer: 'Dependencies',
    description: 'Konfigurasi dependencies Flutter untuk Riverpod, HTTP client, dan icon/shimmer.',
    code: `name: digital_library_explorer
description: Digital Library Explorer menggunakan Open Library API dan Clean Architecture Riverpod.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.10.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management Riverpod standar tanpa build_runner
  flutter_riverpod: ^2.5.1

  # HTTP Client untuk konsumsi REST API Open Library
  http: ^1.2.1

  # Komponen UI opsional untuk caching gambar & shimmer effect
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    id: 'main',
    filename: 'main.dart',
    path: 'lib/main.dart',
    layer: 'App Entry Point',
    description: 'Inisialisasi ProviderScope Riverpod dan Material 3 ThemeData.',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'ui/widgets/book_explorer_widget.dart';

void main() {
  // ProviderScope membungkus seluruh hierarki widget agar Riverpod dapat mengelola state
  runApp(
    const ProviderScope(
      child: DigitalLibraryApp(),
    ),
  );
}

class DigitalLibraryApp extends StatelessWidget {
  const DigitalLibraryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Digital Library Explorer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFC7CEF9),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E2138),
          primary: const Color(0xFF1E2138),
          surface: Colors.white,
        ),
      ),
      home: const BookExplorerWidget(),
    );
  }
}
`,
  },
];
