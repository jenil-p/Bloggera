import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaHome, FaSearch, FaUser, FaShieldAlt, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import '../index.css'

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Placeholder for authentication state (replace with actual auth logic)
  const isAuthenticated = true;

  // Hide the navbar on the Enter page ("/")
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="sticky top-4 z-50 mx-auto mt-4 w-[90%] max-w-4xl rounded-full backdrop-blur-3xl px-6 py-3 shadow-lg flex items-center justify-between">
      {/* Logo */}
      <Link to="/home" className="flex items-center space-x-2">
        <h1 className="text-2xl font-extrabold gradient-text animate-pulse">
          Bloggera
        </h1>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            {/* Home Link */}
            <Link to="/home" className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 transform hover:scale-110">
              <FaHome className="text-lg" />
              <span className="hidden md:inline">Home</span>
            </Link>

            {/* Search Link */}
            <Link to="/search" className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 transform hover:scale-110">
              <FaSearch className="text-lg" />
              <span className="hidden md:inline">Search</span>
            </Link>

            {/* Profile Link */}
            <Link to="/profile" className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 transform hover:scale-110">
              <FaUser className="text-lg" />
              <span className="hidden md:inline">Profile</span>
            </Link>

            {/* Admin Link */}
            <Link to="/admin" className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 transform hover:scale-110">
              <FaShieldAlt className="text-lg" />
              <span className="hidden md:inline">Admin</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => {
                // Placeholder for logout logic
                navigate('/');
              }}
              className="flex items-center space-x-1 text-theme hover:text-red-500 transition-all duration-300 transform hover:scale-110"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 text-theme hover:text-gray-500 transition-all duration-300 transform hover:scale-110"
          >
            <FaUser className="text-lg" />
            <span className="hidden md:inline">Login / Signup</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 transition-all duration-300 transform hover:scale-110"
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

export default Navbar;