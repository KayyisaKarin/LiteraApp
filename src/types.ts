export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
  has_fulltext?: boolean;
  ratings_average?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  numFoundExact?: boolean;
  docs: OpenLibraryDoc[];
}

export interface Book {
  key: string;
  title: string;
  authorNames: string[];
  firstPublishYear?: number;
  coverId?: number;
  editionCount?: number;
  hasFullText: boolean;
  ratingsAverage?: number;
  coverUrl?: string;
}
