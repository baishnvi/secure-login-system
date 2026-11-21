import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../api.js';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Demonstrates a call to the protected backend endpoint GET /api/auth/me
  const callProtected = async () => {
    setBusy(true);
    try {
      const data = await api.me();
      setResult({ ok: true, status: 200, body: data });
    } catch (err) {
      setResult({ ok: false, status: err.status, body: { message: err.message } });
    } finally {
      setBusy(false);
    }
  };

  const joined = new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="brand">aze<span>Solution</span></div>
        <button className="btn-outline" onClick={handleLogout}>Log out</button>
      </header>

      <main className="dash-main">
        <h1>Hello, {user.full_name}</h1>
        <p className="subtitle">You are signed in. This page is only available to authenticated users.</p>

        <section className="panel">
          <h2>Your account</h2>
          <dl className="details">
            <div><dt>Full name</dt><dd>{user.full_name}</dd></div>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Member since</dt><dd>{joined}</dd></div>
            <div><dt>User ID</dt><dd className="mono">{user.id}</dd></div>
          </dl>
        </section>

        <section className="panel">
          <h2>Protected endpoint demo</h2>
          <p className="muted">Calls <code>GET /api/auth/me</code>. The server reads your HttpOnly cookie and returns only safe user fields.</p>
          <button className="btn-primary btn-inline" onClick={callProtected} disabled={busy}>
            {busy ? 'Requesting…' : 'Call /api/auth/me'}
          </button>
          {result && (
            <pre className={`result ${result.ok ? 'ok' : 'bad'}`}>
              HTTP {result.status}{'\n'}{JSON.stringify(result.body, null, 2)}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}
