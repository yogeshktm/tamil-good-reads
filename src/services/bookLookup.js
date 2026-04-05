/**
 * Looks up book details by ISBN.
 * Primary:  Google Books API  (free, no key needed for basic use)
 * Fallback: Open Library API  (free, open)
 */

export async function lookupByISBN(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');

  // --- Google Books ---
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}&maxResults=1`
    );
    const data = await res.json();
    if (data.totalItems > 0) {
      const info = data.items[0].volumeInfo;
      const cover =
        info.imageLinks?.extraLarge ||
        info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.thumbnail ||
        '';
      return {
        title:       info.title || '',
        author:      (info.authors || []).join(', '),
        genre:       (info.categories || []).join(', '),
        publisher:   info.publisher || '',
        pageCount:   info.pageCount || '',
        description: info.description || '',
        coverUrl:    cover.replace('http://', 'https://'),
      };
    }
  } catch (_) { /* fall through */ }

  // --- Open Library fallback ---
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&jscmd=details&format=json`
    );
    const data = await res.json();
    const key = `ISBN:${clean}`;
    if (data[key]) {
      const d = data[key].details;
      const coverId = d.covers?.[0];
      return {
        title:       d.title || '',
        author:      (d.authors || []).map(a => a.name).join(', '),
        genre:       (d.subjects || []).slice(0, 2).join(', '),
        publisher:   (d.publishers || []).join(', '),
        pageCount:   d.number_of_pages || '',
        description: d.description?.value || d.description || '',
        coverUrl:    coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : '',
      };
    }
  } catch (_) { /* fall through */ }

  return null; // nothing found
}

/**
 * Searches for books by title/author.
 */
export async function searchByText(query) {
  if (!query) return [];
  
  // Clean query: remove common OCR noise but preserve spaces
  const cleanQuery = query
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanQuery.length < 3) return [];

  console.log('[bookLookup] Searching for:', cleanQuery);

  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=8`
    );
    const data = await res.json();
    
    if (!data.items) {
      console.warn('[bookLookup] No results found for:', cleanQuery);
      return [];
    }

    return data.items.map(item => {
      const info = item.volumeInfo;
      const cover =
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        '';
      return {
        id:          item.id,
        title:       info.title || '',
        author:      (info.authors || []).join(', '),
        genre:       (info.categories || []).join(', '),
        publisher:   info.publisher || '',
        year:        info.publishedDate?.split('-')[0] || '',
        pageCount:   info.pageCount || '',
        description: info.description || '',
        isbn:        info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || 
                     info.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier || '',
        coverUrl:    cover.replace('http://', 'https://'),
      };
    });
  } catch (err) {
    console.error('[bookLookup] Search error:', err);
    return [];
  }
}
