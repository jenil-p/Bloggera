import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostCard from './posts/PostCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

function Search() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchResults, setSearchResults] = useState({ posts: [], users: [], tags: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      query.append('q', searchQuery);
      if (selectedCategory) query.append('category', selectedCategory);
      const response = await api.get(`/search?${query.toString()}`);
      setSearchResults(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching');
      setLoading(false);
    }
  };

  const handleLike = (postId, isLiked) => {
    setSearchResults({
      ...searchResults,
      posts: searchResults.posts.map(post =>
        post._id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
      ),
    });
  };

  const handleSave = (postId, isSaved) => {
    setSearchResults({
      ...searchResults,
      posts: searchResults.posts.map(post =>
        post._id === postId ? { ...post, isSaved } : post
      ),
    });
  };

  const handleComment = (postId, commentCount) => {
    setSearchResults({
      ...searchResults,
      posts: searchResults.posts.map(post =>
        post._id === postId ? { ...post, comments: commentCount } : post
      ),
    });
  };

  const handleReport = async (postId, reason, message) => {
    try {
      await api.post(`/posts/${postId}/report`, { reason, message });
      alert(`Reported post ${postId}: ${reason} - ${message}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error reporting post');
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'posts', label: 'Posts' },
    { id: 'users', label: 'Users' },
    { id: 'tags', label: 'Tags' },
  ];

  const renderResults = () => {
    if (selectedTab === 'all') {
      return (
        <>
          {searchResults.posts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-theme mb-2">Posts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onClick={() => window.location.href = `/post/${post._id}`}
                  />
                ))}
              </div>
            </div>
          )}
          {searchResults.users.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-theme mb-2">Users</h3>
              <div className="space-y-2">
                {searchResults.users.map(user => (
                  <Link
                    key={user._id}
                    to={`/user/${user.username}`}
                    className="flex items-center p-2 bg-card rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.username}
                      className="h-10 w-10 rounded-full mr-2 object-cover"
                    />
                    <div>
                      <p className="font-bold text-theme">{user.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {searchResults.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-theme mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {searchResults.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {searchResults.posts.length === 0 &&
            searchResults.users.length === 0 &&
            searchResults.tags.length === 0 && (
              <p className="text-center text-theme">No results found</p>
            )}
        </>
      );
    }

    if (selectedTab === 'posts' && searchResults.posts.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onClick={() => window.location.href = `/post/${post._id}`}
            />
          ))}
        </div>
      );
    }

    if (selectedTab === 'users' && searchResults.users.length > 0) {
      return (
        <div className="space-y-2">
          {searchResults.users.map(user => (
            <Link
              key={user._id}
              to={`/user/${user.username}`}
              className="flex items-center p-2 bg-card rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <img
                src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${user.avatar}`}
                alt={user.username}
                className="h-10 w-10 rounded-full mr-2 object-cover"
              />
              <div>
                <p className="font-bold text-theme">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    if (selectedTab === 'tags' && searchResults.tags.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {searchResults.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/posts?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      );
    }

    return <p className="text-center text-theme">No results found</p>;
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center border border-theme rounded-lg bg-card flex-1">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, users, or tags..."
            className="w-full p-2 border-none focus:ring-0 bg-card text-theme"
            autoFocus
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-theme rounded-lg bg-card text-theme"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </form>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading ? (
        <p className="text-center text-theme">Searching...</p>
      ) : (
        <>
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium ${selectedTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-theme hover:text-blue-500'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-6">{renderResults()}</div>
        </>
      )}
    </div>
  );
}

export default Search;