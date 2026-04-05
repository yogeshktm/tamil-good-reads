import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <BookProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
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
