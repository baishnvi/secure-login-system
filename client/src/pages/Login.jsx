import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../AuthContext.jsx';
import { validateEmail, validateLoginPassword } from '../validation.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const justRegistered = location.state?.registered;

  const validators = { email: validateEmail, password: validateLoginPassword };

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateField = (name) => setErrors((e) => ({ ...e, [name]: validators[name](form[name]) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      email: validateEmail(form.email),
      password: validateLoginPassword(form.password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    setApiError('');
    try {
      await login({ email: form.email.trim(), password: form.password, remember: form.remember });
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message);
      if (err.fieldErrors) setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your email and password."
      footer={<>New to azeSolution? <Link to="/register">Create an account</Link></>}
    >
      {justRegistered && <div className="alert alert-success" role="status">Account created. Please sign in.</div>}
      {apiError && <div className="alert alert-error" role="alert">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <div className={`input-wrap ${errors.email ? 'has-error' : ''}`}>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              onBlur={() => validateField('email')}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            onBlur={() => validateField('password')}
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
          />
          {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
        </div>

        <div className="row-between">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setField('remember', e.target.checked)}
              disabled={loading}
            />
            <span>Remember me for 7 days</span>
          </label>
          <Link to="/forgot-password" className="link-small">Forgot password?</Link>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (<><span className="spinner" aria-hidden="true" /> Signing in…</>) : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
