import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading" role="status">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
