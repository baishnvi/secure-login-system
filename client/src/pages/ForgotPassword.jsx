import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { validateEmail } from '../validation.js';

// Placeholder flow (allowed by the assessment): no email is actually sent.
// A real implementation would create a single-use, expiring reset token and email a link.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validateEmail(email);
    setError(msg);
    if (!msg) setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we will send reset instructions."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {sent ? (
        <div className="alert alert-success" role="status">
          If an account exists for {email.trim()}, reset instructions will be sent. (Demo placeholder: no email is sent in this project.)
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <div className={`input-wrap ${error ? 'has-error' : ''}`}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!error}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>
          <button type="submit" className="btn-primary">Send reset link</button>
        </form>
      )}
    </AuthLayout>
  );
}
