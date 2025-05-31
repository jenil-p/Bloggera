import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../index.css';

function Login({ onSuccess, onSwitchToSignup }) {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder for login logic
    onSuccess();
    navigate('/home');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border p-3  border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Password</label>
        <input
          type="password"
          className="w-full rounded-lg border p-3 border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter your password"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-blue-600 py-3 text-white font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
      >
        Login
      </button>
      <p className="text-center text-sm text-white">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-blue-500 hover:underline dark:text-blue-400"
        >
          Signup
        </button>
      </p>
    </form>
  );
}

export default Login;