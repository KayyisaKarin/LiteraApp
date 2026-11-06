import { Book, OpenLibraryDoc, OpenLibrarySearchResponse } from '../types';

export function mapDocToBook(doc: OpenLibraryDoc): Book {
  const coverId = doc.cover_i;
  return {
    key: doc.key || `temp_${Math.random()}`,
    title: doc.title || 'Untitled',
    authorNames: doc.author_name || [],
    firstPublishYear: doc.first_publish_year,
    coverId: coverId,
    editionCount: doc.edition_count,
    hasFullText: !!doc.has_fulltext,
    ratingsAverage: typeof doc.ratings_average === 'number' ? Number(doc.ratings_average.toFixed(2)) : undefined,
    coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
  };
}

export async function searchOpenLibrary(
  query: string,
  limit: number = 10,
  start: number = 0,
  signal?: AbortSignal
): Promise<{ books: Book[]; numFound: number; start: number }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { books: [], numFound: 0, start: 0 };
  }

  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', limit.toString());
  if (start > 0) {
    url.searchParams.set('offset', start.toString());
  }
  url.searchParams.set(
    'fields',
    'key,title,author_name,first_publish_year,cover_i,edition_count,has_fulltext,ratings_average'
  );

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Open Library API Error (${response.status}): ${response.statusText}`);
  }

  const data: OpenLibrarySearchResponse = await response.json();
  const docs = Array.isArray(data.docs) ? data.docs : [];
  const books = docs.map(mapDocToBook);

  return {
    books,
    numFound: data.numFound || 0,
    start: data.start || start,
  };
}
