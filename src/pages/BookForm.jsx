import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useBooks } from '../context/BookContext';
import { lookupByISBN } from '../services/bookLookup';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';

const EMPTY_BOOK = {
  isbn: '', title: '', author: '', genre: '', publisher: '',
  pageCount: '', coverUrl: '', description: '', status: 'TO_READ',
  notes: '', experience: 0, finishedAt: '',
  boughtDate: '', boughtLocation: '', tags: [],
};

const STATUSES = [
  { value: 'TO_READ',           label: 'To Read' },
  { value: 'CURRENTLY_READING', label: 'Currently Reading' },
  { value: 'READ',              label: 'Read' },
  { value: 'DNF',               label: "Didn't Able to Complete" },
];

const GENRES = [
  'Fiction','Non-Fiction','Mystery','Thriller','Romance','Sci-Fi','Fantasy',
  'Biography','History','Self-Help','Philosophy','Science','Technology',
  'Art','Travel','Poetry','Other'
];

export default function BookForm() {
  const { id } = useParams();
  const { books, addBook, updateBook } = useBooks();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const existing = isEdit ? books.find(b => b.id === id) : null;

  const [form, setForm]         = useState(existing || EMPTY_BOOK);
  const [looking, setLooking]   = useState(false);
  const [lookupMsg, setLookupMsg] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (existing) setForm(existing);
    
    // Check for data passed from scanner
    if (!isEdit && location.state?.bookData) {
      setForm(f => ({ ...f, ...location.state.bookData }));
      // Clear state so it doesn't re-fill if user navigates away and back
      window.history.replaceState({}, document.title);
    }
  }, [id, existing, location.state]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleLookup = async () => {
    if (!form.isbn.trim()) return;
    setLooking(true);
    setLookupMsg(null);
    try {
      const result = await lookupByISBN(form.isbn);
      if (result) {
        setForm(f => ({ ...f, ...result }));
        setLookupMsg({ type: 'success', text: `✅ Found: "${result.title}"` });
      } else {
        setLookupMsg({ type: 'error', text: '❌ No book found for this ISBN.' });
      }
    } catch {
      setLookupMsg({ type: 'error', text: '❌ Lookup failed. Check your connection.' });
    } finally {
      setLooking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (isEdit) {
      updateBook({ ...form, id });
      navigate(`/book/${id}`);
    } else {
      const newBook = { ...form, id: uuidv4(), addedAt: new Date().toISOString() };
      addBook(newBook);
      navigate(`/book/${newBook.id}`);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="page-header">
        <h1>{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
        <p>{isEdit ? 'Update your book details' : 'Search by ISBN for instant auto-fill, or enter manually'}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ISBN Lookup */}
        <div className="form-group">
          <label className="form-label">ISBN (10 or 13 digits)</label>
          <div className="isbn-row">
            <input
              className="form-input"
              placeholder="e.g. 9780143127741"
              value={form.isbn}
              onChange={e => set('isbn', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
            />
            <button type="button" className="btn btn-secondary" onClick={handleLookup} disabled={looking || !form.isbn.trim()}>
              {looking ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
              {looking ? 'Looking up…' : 'Lookup'}
            </button>
          </div>
          {lookupMsg && (
            <div className={`alert alert-${lookupMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              {lookupMsg.text}
            </div>
          )}
        </div>

        {/* Title & Author */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Book title" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Author</label>
            <input className="form-input" placeholder="Author name" value={form.author} onChange={e => set('author', e.target.value)} />
          </div>
        </div>

        {/* Genre & Publisher */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Genre</label>
            <select className="form-select" value={form.genre} onChange={e => set('genre', e.target.value)}>
              <option value="">Select genre…</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              {form.genre && !GENRES.includes(form.genre) && (
                <option value={form.genre}>{form.genre}</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Publisher</label>
            <input className="form-input" placeholder="Publisher" value={form.publisher} onChange={e => set('publisher', e.target.value)} />
          </div>
        </div>

        {/* Purchase Info */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Bought Date</label>
            <input className="form-input" type="date" value={form.boughtDate?.split('T')[0] || ''} onChange={e => set('boughtDate', e.target.value ? new Date(e.target.value).toISOString() : '')} />
          </div>
          <div className="form-group">
            <label className="form-label">Bought Location</label>
            <input className="form-input" placeholder="e.g. Amazon, Local Bookstore" value={form.boughtLocation} onChange={e => set('boughtLocation', e.target.value)} />
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags (comma separated)</label>
          <input 
            className="form-input" 
            placeholder="e.g. favorite, gifted, hardcover" 
            value={form.tags?.join(', ') || ''} 
            onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
          />
          {form.tags?.length > 0 && (
            <div className="tags-preview" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {form.tags.map((tag, i) => (
                <span key={i} className="badge" style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '12px' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Page Count & Status */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Page Count</label>
            <input className="form-input" type="number" min="0" placeholder="e.g. 320" value={form.pageCount} onChange={e => set('pageCount', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reading Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Finished At (show if READ or DNF) */}
        {(form.status === 'READ' || form.status === 'DNF') && (
          <div className="form-group">
            <label className="form-label">{form.status === 'READ' ? 'Date Finished' : 'Date Abandoned'}</label>
            <input className="form-input" type="date" value={form.finishedAt?.split('T')[0] || ''} onChange={e => set('finishedAt', e.target.value ? new Date(e.target.value).toISOString() : '')} />
          </div>
        )}

        {/* Cover URL */}
        <div className="form-group">
          <label className="form-label">Cover Image URL</label>
          <div className="isbn-row">
            <input className="form-input" placeholder="https://…" value={form.coverUrl} onChange={e => set('coverUrl', e.target.value)} />
            {form.coverUrl && (
              <img src={form.coverUrl} alt="cover preview" style={{ width: 52, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="Book summary or description…" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">My Notes</label>
          <textarea className="form-textarea" placeholder="Personal notes, quotes, thoughts…" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {/* Experience / Star Rating */}
        <div className="form-group">
          <label className="form-label">My Experience (Rating)</label>
          <div className="star-rating">
            {[1,2,3,4,5].map(n => (
              <span
                key={n}
                className={`star ${n <= form.experience ? 'filled' : 'empty'}`}
                onClick={() => set('experience', n === form.experience ? 0 : n)}
              >★</span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-1" style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary">
            {isEdit ? '💾 Save Changes' : '📚 Add Book'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
