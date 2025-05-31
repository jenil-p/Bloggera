// src/pages/Search.jsx
import { useState } from 'react';
import Post from '../components/Post';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Search() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    posts: [],
    users: [],
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchResults({
      posts: [
        {
          id: 1,
          author: { name: 'John Doe', username: 'johndoe', avatar: 'https://via.placeholder.com/40' },
          content: `This post contains ${searchQuery}`,
          image: null,
          likes: 10,
          comments: 5,
          shares: 2,
          isLiked: false,
          isSaved: false,
        },
      ],
      users: [
        { name: 'John Doe', username: 'johndoe', avatar: 'https://via.placeholder.com/40' },
      ],
    });
  };

  const handleLike = (postId, isLiked) => {
    setSearchResults({
      ...searchResults,
      posts: searchResults.posts.map(post =>
        post.id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
      ),
    });
  };

  const handleSave = (postId, isSaved) => {
    setSearchResults({
      ...searchResults,
      posts: searchResults.posts.map(post =>
        post.id === postId ? { ...post, isSaved } : post
      ),
    });
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
      <div className="space-y-6">
        {searchResults.users.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-theme mb-2">Users</h3>
            <div className="space-y-2">
              {searchResults.users.map(user => (
                <Link
                  key={user.username}
                  to={`/user/${user.username}`}
                  className="flex items-center p-2 bg-card rounded-lg shadow-md"
                >
                  <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full mr-2" />
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
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={() => alert('Comment functionality to be implemented')}
                  onShare={() => alert('Share functionality to be implemented')}
                  onSave={handleSave}
                  onReport={(id, reason, message) => alert(`Reported post ${id}: ${reason} - ${message}`)}
                  isOwnPost={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;