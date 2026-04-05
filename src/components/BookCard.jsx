import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import StatusBadge from './StatusBadge';

export default function BookCard({ book }) {
  const { deleteBook, isAdmin } = useBooks();
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${book.title}"?`)) deleteBook(book.id);
  };

  return (
    <div className="book-card fade-in">
      {/* Cover */}
      <div className="book-card-cover">
        {book.coverUrl
          ? <img src={book.coverUrl} alt={book.title} loading="lazy" />
          : (
            <div className="book-cover-placeholder">
              <BookOpen size={32} opacity={0.3} />
              <span>{book.title}</span>
            </div>
          )
        }
        {/* Actions overlay */}
        <div className="book-card-actions">
          <button
            className="book-card-action-btn view"
            onClick={() => navigate(`/book/${book.id}`)}
            title="View"
          >
            <Eye size={13} />
          </button>
          {isAdmin && (
            <>
              <button
                className="book-card-action-btn edit"
                onClick={(e) => { e.stopPropagation(); navigate(`/edit/${book.id}`); }}
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                className="book-card-action-btn delete"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="book-card-body" onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <StatusBadge status={book.status} />
          <div className="book-card-title">{book.title}</div>
          <div className="book-card-author">{book.author || 'Unknown Author'}</div>
        </div>
        
        {book.tags?.length > 0 && (
          <div className="book-card-tags" style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {book.tags.slice(0, 2).map((tag, i) => (
              <span key={i} style={{ fontSize: '0.65rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '8px' }}>
                #{tag}
              </span>
            ))}
            {book.tags.length > 2 && <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>+{book.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
