import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminProtectedRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded.isAdmin) {
      return <Navigate to="/home" replace />;
    }
    return <Outlet />;
  } catch (err) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
}

export default AdminProtectedRoute;