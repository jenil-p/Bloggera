import { useState, useEffect } from 'react';
import Post from '../components/Post';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

function Search() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  const handleShare = (postId) => {
    setSearchResults({
      ...searchResults,
      posts: searchResults.posts.map(post =>
        post._id === postId ? { ...post, shares: post.shares + 1 } : post
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center border border-theme rounded-lg bg-card">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, users, or tags..."
            className="w-full p-2 border-none focus:ring-0 bg-card text-theme"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <p className="text-center text-theme">Searching...</p>
      ) : (
        <div className="space-y-6">
          {searchResults.users.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-theme mb-2">Users</h3>
              <div className="space-y-2">
                {searchResults.users.map(user => (
                  <Link
                    key={user._id}
                    to={`/user/${user.username}`}
                    className="flex items-center p-2 bg-card rounded-lg shadow-md"
                  >
                    <img
                      src={user.avatar || 'https://via.placeholder.com/40'}
                      alt="avatar"
                      className="h-10 w-10 rounded-full mr-2 object-cover"
                    />
                    <div>
                      <p className="font-bold text-theme">{user.name}</p>
                      <p className="text-gray-500">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {searchResults.posts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-theme mb-2">Posts</h3>
              <div className="space-y-4">
                {searchResults.posts.map(post => (
                  <Post
                    key={post._id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onSave={handleSave}
                    onReport={handleReport}
                    isOwnPost={post.author._id.toString() === localStorage.getItem('userId')}
                    onDelete={() => {}}
                    onArchive={() => {}}
                    onRestrictComments={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
          {searchResults.posts.length === 0 && searchResults.users.length === 0 && (
            <p className="text-center text-theme">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;