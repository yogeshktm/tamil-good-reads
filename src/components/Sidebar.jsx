import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, Library, BarChart2, QrCode, User, Plus, ScanLine, X
} from 'lucide-react';
import { useBooks } from '../context/BookContext';

const adminLinks = [
  { to: '/add', icon: Plus, label: 'Add Book' },
  { to: '/scan', icon: ScanLine, label: 'Cover Scanner' },
];

const publicLinks = [
  { to: '/', icon: BookOpen, label: 'Dashboard' },
  { to: '/library', icon: Library, label: 'My Library' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function Sidebar({ isOpen, closeSidebar }) {
  const { profile, isAdmin, logout } = useBooks();
  const navigate = useNavigate();
  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BL';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header-mobile">
        <div className="sidebar-logo">
          <BookOpen size={22} />
          <span>BookShelf</span>
        </div>
        <button className="btn btn-ghost mobile-close-btn" onClick={closeSidebar}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {publicLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {isAdmin && adminLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAdmin && (
          <button className="btn btn-ghost" onClick={logout} style={{ width: '100%', marginBottom: '1rem', justifyContent: 'flex-start' }}>
            <User size={17} /> Logout Admin
          </button>
        )}

        <button className="sidebar-profile" onClick={() => navigate('/profile')}>
          <div className="sidebar-avatar">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.name} />
              : initials}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{profile.name}</div>
            <div className="sidebar-profile-sub">View Profile</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
