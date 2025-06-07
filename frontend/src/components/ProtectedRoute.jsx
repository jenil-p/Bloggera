// import { Navigate, Outlet } from 'react-router-dom';

// function ProtectedRoute() {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     return <Navigate to="/" replace />;
//   }
//   return <Outlet />;
// }

// export default ProtectedRoute;


import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
}

export default ProtectedRoute;