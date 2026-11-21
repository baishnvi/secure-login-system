import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { api } from '../api.js';
import { validateEmail, validateName, validateNewPassword } from '../validation.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validators = { full_name: validateName, email: validateEmail, password: validateNewPassword };

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateField = (name) => setErrors((e) => ({ ...e, [name]: validators[name](form[name]) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      full_name: validateName(form.full_name),
      email: validateEmail(form.email),
      password: validateNewPassword(form.password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    setApiError('');
    try {
      await api.register({ full_name: form.full_name.trim(), email: form.email.trim(), password: form.password });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setApiError(err.message);
      if (err.fieldErrors) setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      {apiError && <div className="alert alert-error" role="alert">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <div className={`input-wrap ${errors.full_name ? 'has-error' : ''}`}>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              onBlur={() => validateField('full_name')}
              autoComplete="name"
              placeholder="Your full name"
              disabled={loading}
              aria-invalid={!!errors.full_name}
            />
          </div>
          {errors.full_name && <p className="field-error">{errors.full_name}</p>}
        </div>

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
            />
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            onBlur={() => validateField('password')}
            error={errors.password}
            autoComplete="new-password"
            disabled={loading}
          />
          {errors.password ? (
            <p className="field-error" id="password-error">{errors.password}</p>
          ) : (
            <p className="hint">At least 8 characters, with a letter and a number.</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (<><span className="spinner" aria-hidden="true" /> Creating account…</>) : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
