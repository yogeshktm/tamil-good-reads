import { useState } from 'react';
import { useBooks } from '../context/BookContext';
import { CheckCircle } from 'lucide-react';

export default function Profile() {
  const { profile, setProfile } = useBooks();
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BL';

  return (
    <div className="fade-in profile-layout">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Personalize your BookShelf experience</p>
      </div>

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={16} /> Profile saved successfully!
        </div>
      )}

      {/* Avatar Preview */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-lg">
          {form.avatarUrl
            ? <img src={form.avatarUrl} alt={form.name} onError={e => e.target.style.display = 'none'} />
            : initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{form.name || 'Book Lover'}</div>
          <div className="text-muted text-sm">{form.email || 'No email set'}</div>
        </div>
      </div>

      <form onSubmit={handleSave} className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input className="form-input" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Avatar URL</label>
          <input className="form-input" placeholder="https://…" value={form.avatarUrl} onChange={e => set('avatarUrl', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" placeholder="Tell us about your reading taste…" value={form.bio} onChange={e => set('bio', e.target.value)} style={{ minHeight: 80 }} />
        </div>

        <div>
          <button type="submit" className="btn btn-primary">💾 Save Profile</button>
        </div>
      </form>
    </div>
  );
}
