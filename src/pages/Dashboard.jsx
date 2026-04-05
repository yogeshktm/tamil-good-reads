import { useBooks } from '../context/BookContext';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { Plus, BookOpen, BookCheck, BookMarked, BookX, Layers } from 'lucide-react';

export default function Dashboard() {
  const { books, profile, isAdmin } = useBooks();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const total              = books.length;
  const readThisYear       = books.filter(b => b.status === 'READ' && b.finishedAt?.startsWith(String(currentYear))).length;
  const currentlyReading   = books.filter(b => b.status === 'CURRENTLY_READING').length;
  const toRead             = books.filter(b => b.status === 'TO_READ').length;
  const dnf                = books.filter(b => b.status === 'DNF').length;
  const recent             = [...books].slice(0, 6);

  const stats = [
    { label: 'Total Books',       value: total,            icon: <Layers size={20} />,     color: 'var(--accent)' },
    { label: `Read in ${currentYear}`, value: readThisYear, icon: <BookCheck size={20} />, color: 'var(--green)' },
    { label: 'Currently Reading', value: currentlyReading, icon: <BookOpen size={20} />,   color: 'var(--amber)' },
    { label: 'To Read',           value: toRead,           icon: <BookMarked size={20} />, color: 'var(--blue)' },
    { label: "Didn't Complete",   value: dnf,              icon: <BookX size={20} />,      color: 'var(--red)' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Welcome back, {profile.name.split(' ')[0]} 👋</h1>
          <p>Here's your reading overview</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/add')}>
            <Plus size={16} /> Add Book
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Books */}
      <div style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recently Added</h2>
          {books.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/library')}>
              View All
            </button>
          )}
        </div>

        {books.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-state-icon">📚</div>
            <h3>Your shelf is empty</h3>
            <p>Start by adding your first book — search by ISBN for instant details!</p>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => navigate('/add')}>
                <Plus size={16} /> Add First Book
              </button>
            )}
          </div>
        ) : (
          <div className="books-grid">
            {recent.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </div>
    </div>
  );
}
