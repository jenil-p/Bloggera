// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Enter from './pages/Enter';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
          <Navbar />
          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<Enter />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/user/:username" element={<UserProfile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Enter />} />
              <Route path="/signup" element={<Enter />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;