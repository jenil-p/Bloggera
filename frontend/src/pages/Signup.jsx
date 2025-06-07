import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

function Signup({ onSuccess, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', {
        name,
        username,
        email,
        password,
      });
      const { token, user } = response.data;

      // Store JWT token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);

      // Call onSuccess to close the modal
      onSuccess();

      // Redirect based on isAdmin status
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-3 border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Enter your name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border p-3 border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Choose a username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3 border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3 border-[var(--border-color)] text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Create a password"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-full py-3 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
          loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Signing up...' : 'Signup'}
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