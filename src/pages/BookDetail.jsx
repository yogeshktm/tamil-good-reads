import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Pencil, Trash2, BookOpen, Hash, Building2, FileText } from 'lucide-react';

export default function BookDetail() {
  const { id } = useParams();
  const { books, deleteBook, isAdmin } = useBooks();
  const navigate = useNavigate();
  const book = books.find(b => b.id === id);

  if (!book) {
    return (
      <div className="empty-state fade-in">
        <div className="empty-state-icon">🔍</div>
        <h3>Book not found</h3>
        <p>This book may have been deleted.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/library')}>
          Back to Library
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${book.title}"?`)) {
      deleteBook(book.id);
      navigate('/library');
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`star ${i < (book.experience || 0) ? 'filled' : 'empty'}`}>★</span>
  ));

  return (
    <div className="fade-in">
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="book-detail-layout">
        {/* Cover */}
        <div>
          <div className="book-detail-cover">
            {book.coverUrl
              ? <img src={book.coverUrl} alt={book.title} />
              : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)' }}>
                  <BookOpen size={60} opacity={0.2} />
                </div>
              )
            }
          </div>
        </div>

        {/* Info */}
        <div className="book-detail-info">
          <div>
            <StatusBadge status={book.status} />
            <h1 className="book-detail-title" style={{ marginTop: '0.75rem' }}>{book.title}</h1>
            <p className="book-detail-author">{book.author}</p>
          </div>

          {/* Star rating */}
          {book.experience > 0 && (
            <div className="star-rating">{stars}</div>
          )}

          {/* Meta chips */}
          <div className="book-detail-meta">
            {book.isbn && (
              <span className="meta-chip"><Hash size={13} /> ISBN: {book.isbn}</span>
            )}
            {book.genre && (
              <span className="meta-chip">📚 {book.genre}</span>
            )}
            {book.publisher && (
              <span className="meta-chip"><Building2 size={13} /> {book.publisher}</span>
            )}
            {book.pageCount && (
              <span className="meta-chip"><FileText size={13} /> {book.pageCount} pages</span>
            )}
            {book.addedAt && (
              <span className="meta-chip">📅 Added {new Date(book.addedAt).toLocaleDateString()}</span>
            )}
            {book.boughtDate && (
              <span className="meta-chip">🛍️ Bought {new Date(book.boughtDate).toLocaleDateString()}</span>
            )}
            {book.boughtLocation && (
              <span className="meta-chip">📍 {book.boughtLocation}</span>
            )}
            {book.finishedAt && (
              <span className="meta-chip">✅ Finished {new Date(book.finishedAt).toLocaleDateString()}</span>
            )}
          </div>

          {/* Tags */}
          {book.tags?.length > 0 && (
            <div className="book-detail-tags" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {book.tags.map((tag, i) => (
                <span key={i} className="badge" style={{ fontSize: '0.8rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '12px' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {book.description && (
            <div className="book-detail-section">
              <h4>Description</h4>
              <p>{book.description}</p>
            </div>
          )}

          {/* Notes */}
          {book.notes && (
            <div className="book-detail-section">
              <h4>My Notes</h4>
              <p style={{ color: 'var(--text)' }}>{book.notes}</p>
            </div>
          )}

          {/* Actions */}
          {isAdmin && (
            <div className="flex gap-1" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/edit/${book.id}`)}>
                <Pencil size={15} /> Edit Book
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
