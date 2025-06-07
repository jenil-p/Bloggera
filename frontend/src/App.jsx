import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Enter from './pages/Enter';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { jwtDecode } from 'jwt-decode';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
          <Navbar />
          <main className="flex-grow pt-20">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Enter />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<Navigate to="/" replace />} />

              {/* Protected routes for authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route path="/user/:username" element={<UserProfile />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<Dashboard />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;