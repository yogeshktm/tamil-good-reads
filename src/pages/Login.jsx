import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useBooks();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid admin key. Please try again.');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 400, margin: '100px auto' }}>
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--accent-glow)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Lock size={30} color="var(--accent)" />
        </div>
        
        <h1 style={{ marginBottom: '0.5rem' }}>Admin Login</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Enter your secret key to manage your bookshelf</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Enter Secret Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          
          {error && <div className="alert alert-error" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Unlock Admin Access
          </button>
        </form>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        Default key is <code>admin123</code> for testing.
      </p>
    </div>
  );
}
