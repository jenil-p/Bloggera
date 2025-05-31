// src/pages/UserProfile.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Post from '../components/Post';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function UserProfile() {
  const { username } = useParams();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setUser({
      name: 'John Doe',
      username: username,
      avatar: 'https://via.placeholder.com/40',
      bio: 'I love blogging!',
    });
    setPosts([
      {
        id: 1,
        author: { name: 'John Doe', username: username, avatar: 'https://via.placeholder.com/40' },
        content: 'This is a post by ' + username,
        image: null,
        likes: 10,
        comments: 5,
        shares: 2,
        isLiked: false,
        isSaved: false,
      },
    ]);
  }, [username]);

  const handleLike = (postId, isLiked) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
    ));
  };

  const handleSave = (postId, isSaved) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isSaved } : post
    ));
  };

  const handleBlock = () => {
    setIsBlocked(true);
    alert(`User ${username} blocked`);
  };

  if (isBlocked) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-center text-theme">You have blocked this user.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-center text-theme">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={user.avatar} alt="avatar" className="h-16 w-16 rounded-full mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-theme">{user.name}</h2>
              <p className="text-gray-500">@{user.username}</p>
              <p className="text-theme">{user.bio}</p>
            </div>
          </div>
          <button
            onClick={handleBlock}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Block User
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {posts.map(post => (
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
  );
}

export default UserProfile;