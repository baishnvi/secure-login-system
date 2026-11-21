export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="brand">aze<span>Solution</span></div>
        <div className="aside-copy">
          <h2>Software services and technology, one secure sign-in.</h2>
          <p>Your session is protected with HttpOnly cookies, hashed passwords and login rate limiting.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="brand brand-mobile">aze<span>Solution</span></div>
          <h1>{title}</h1>
          <p className="subtitle">{subtitle}</p>
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
