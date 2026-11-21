import { useState } from 'react';

export default function PasswordInput({ id, value, onChange, onBlur, error, autoComplete, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`input-wrap ${error ? 'has-error' : ''}`}>
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder="Enter your password"
      />
      <button
        type="button"
        className="toggle-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
