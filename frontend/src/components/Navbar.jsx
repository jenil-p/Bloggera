import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaHome, FaSearch, FaUser, FaShieldAlt, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import '../index.css';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  let isAdmin = false;

  if (isAuthenticated) {
    try {
      const decoded = jwtDecode(token);
      isAdmin = decoded.isAdmin || false;
    } catch (err) {
      localStorage.removeItem('token');
    }
  }

  const handleLogout = async () => {
    if (confirm("Are you sure want to log out?")) {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  if (location.pathname === '/') return null;

  return (
    <nav className="sticky top-4 z-50 mx-auto mt-4 w-[90%] max-w-4xl rounded-full backdrop-blur-3xl px-6 py-3 shadow-lg flex items-center justify-between bg-white/10 dark:bg-black/10 border border-white/10">
      <Link to="/home" className="flex items-center space-x-2">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          Bloggera
        </h1>
      </Link>

      <div className="flex items-center gap-4 md:gap-6">
        {isAuthenticated ? (
          <>
            <NavItem to="/home" icon={<FaHome />} text="Home" />
            <NavItem to="/search" icon={<FaSearch />} text="Search" />
            <NavItem to="/profile" icon={<FaUser />} text="Profile" />
            {isAdmin && <NavItem to="/admin" icon={<FaShieldAlt />} text="Admin" />}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-theme hover:text-red-500 transition-all duration-300 hover:scale-110"
              aria-label="Logout"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 hover:scale-110"
            aria-label="Login"
          >
            <FaUser className="text-lg" />
            <span className="hidden md:inline">Login</span>
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 dark:bg-black/20 transition-all duration-300 hover:scale-110"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <FaMoon className="text-lg text-theme" />
          ) : (
            <FaSun className="text-lg text-theme" />
          )}
        </button>
      </div>
    </nav>
  );
}

const NavItem = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 hover:scale-110"
    aria-label={text}
  >
    <span className="text-lg">{icon}</span>
    <span className="hidden md:inline">{text}</span>
  </Link>
);

export default Navbar;