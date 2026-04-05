import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookOpen, Menu } from 'lucide-react';
import { BookProvider, useBooks } from './context/BookContext';
import Sidebar from './components/Sidebar';
import Dashboard  from './pages/Dashboard';
import Library    from './pages/Library';
import BookDetail from './pages/BookDetail';
import BookForm   from './pages/BookForm';
import CoverScanner from './pages/CoverScanner';
import Analytics  from './pages/Analytics';
import Profile    from './pages/Profile';
import Login      from './pages/Login';

function ProtectedRoute({ children }) {
  const { isAdmin } = useBooks();
  return isAdmin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BookProvider>
      <BrowserRouter>
        <div className="app-layout">
          {/* Mobile Header */}
          <div className="mobile-header">
            <div className="mobile-header-logo">
              <BookOpen size={22} color="#f5b942" />
              <span>BookShelf</span>
            </div>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} color="#e8eaf0" />
            </button>
          </div>
          
          {/* Overlay for mobile sidebar */}
          <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
          <main className="main-content">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/library"    element={<Library />} />
              <Route path="/book/:id"   element={<BookDetail />} />
              <Route path="/login"      element={<Login />} />
              
              {/* Protected Admin Routes */}
              <Route path="/add"        element={<ProtectedRoute><BookForm /></ProtectedRoute>} />
              <Route path="/edit/:id"   element={<ProtectedRoute><BookForm /></ProtectedRoute>} />
              <Route path="/scan"       element={<ProtectedRoute><CoverScanner /></ProtectedRoute>} />
              
              <Route path="/analytics"  element={<Analytics />} />
              <Route path="/profile"    element={<Profile />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </BookProvider>
  );
}
