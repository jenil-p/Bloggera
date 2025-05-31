import { useState } from 'react';
import Modal from '../components/Modal';
import Login from './Login';
import Signup from './Signup';
import '../index.css';
import { Link } from 'react-router-dom';

function Enter() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Hero Section */}
      <div className="text-center px-4">
        <h1 className="text-6xl pb-3 md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-300 dark:to-purple-300 animate-pulse">
          Bloggera
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-theme">
          Share Your Thoughts, Connect with the World
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => setShowLogin(true)}
            className="px-8 py-3 rounded-full bg-blue-700 text-white font-semibold text-lg shadow-lg hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 transform hover:scale-105"
          >
            Login
          </button>
          <button
            onClick={() => setShowSignup(true)}
            className="px-8 py-3 rounded-full bg-green-700 text-white font-semibold text-lg shadow-lg hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-300 transform hover:scale-105"
          >
            Signup
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Login">
        <Login onSuccess={() => setShowLogin(false)} onSwitchToSignup={handleSwitchToSignup} />
      </Modal>
      <Modal isOpen={showSignup} onClose={() => setShowSignup(false)} title="Signup">
        <Signup onSuccess={() => setShowSignup(false)} onSwitchToLogin={handleSwitchToLogin} />
      </Modal>
    </div>
  );
}

export default Enter;