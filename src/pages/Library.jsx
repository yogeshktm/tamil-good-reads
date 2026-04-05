import { useState } from 'react';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';
import { Search, Filter } from 'lucide-react';

const STATUSES = ['ALL', 'READ', 'CURRENTLY_READING', 'TO_READ', 'DNF'];
const STATUS_LABELS = {
  ALL: 'All', READ: 'Read', CURRENTLY_READING: 'Currently Reading',
  TO_READ: 'To Read', DNF: "Didn't Complete"
};

export default function Library() {
  const { books } = useBooks();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('ALL');
  const [genre, setGenre]       = useState('ALL');
  const [tag, setTag]           = useState('ALL');
  const [sortBy, setSortBy]     = useState('addedAt');

  const genres = ['ALL', ...new Set(books.map(b => b.genre).filter(Boolean))];
  const tags   = ['ALL', ...new Set(books.flatMap(b => b.tags || []).filter(Boolean))];

  const filtered = books
    .filter(b => {
      const q = search.toLowerCase();
      const matchSearch = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.isbn?.includes(q) || b.tags?.some(t => t.toLowerCase().includes(q));
      const matchStatus = status === 'ALL' || b.status === status;
      const matchGenre  = genre === 'ALL'  || b.genre === genre;
      const matchTag    = tag === 'ALL'    || b.tags?.includes(tag);
      return matchSearch && matchStatus && matchGenre && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === 'title')   return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'author')  return (a.author || '').localeCompare(b.author || '');
      return new Date(b.addedAt) - new Date(a.addedAt);
    });

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>My Library</h1>
        <p>{books.length} book{books.length !== 1 ? 's' : ''} on your shelf</p>
      </div>

      {/* Controls */}
      <div className="library-controls">
        <div className="search-wrap">
          <Search size={15} />
          <input
            className="search-input"
            placeholder="Search title, author, ISBN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="form-select" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>

        {genres.length > 1 && (
          <select className="form-select" style={{ width: 'auto' }} value={genre} onChange={e => setGenre(e.target.value)}>
            {genres.map(g => <option key={g} value={g}>{g === 'ALL' ? 'All Genres' : g}</option>)}
          </select>
        )}

        {tags.length > 1 && (
          <select className="form-select" style={{ width: 'auto' }} value={tag} onChange={e => setTag(e.target.value)}>
            {tags.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Tags' : `#${t}`}</option>)}
          </select>
        )}

        <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="addedAt">Recently Added</option>
          <option value="title">Title A–Z</option>
          <option value="author">Author A–Z</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Filter size={40} opacity={0.3} /></div>
          <h3>No books found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}
    </div>
  );
}
