// Frontend validation (UX only). The server validates everything again.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return '';
}

export function validateLoginPassword(value) {
  return value ? '' : 'Password is required';
}

export function validateName(value) {
  const v = value.trim();
  if (!v) return 'Full name is required';
  if (v.length < 2) return 'Full name must be at least 2 characters';
  return '';
}

export function validateNewPassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return '';
}
