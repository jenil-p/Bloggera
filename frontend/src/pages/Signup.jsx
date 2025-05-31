import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../index.css';

function Signup({ onSuccess, onSwitchToLogin }) {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Placeholder for signup logic
    onSuccess();
    navigate('/home');
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Username</label>
        <input
          type="text"
          className="w-full rounded-lg border p-3  border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Choose a username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border p-3  border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Password</label>
        <input
          type="password"
          className="w-full rounded-lg border p-3  border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Create a password"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-green-600 py-3 text-white font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
      >
        Signup
      </button>
      <p className="text-center text-sm text-white">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:underline dark:text-blue-400"
        >
          Login
        </button>
      </p>
    </form>
  );
}

export default Signup;