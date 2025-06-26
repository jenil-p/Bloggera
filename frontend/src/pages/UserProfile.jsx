import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Post from './posts/Post';
import PostCard from './posts/PostCard';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { MdFormatListBulleted, MdFeaturedPlayList } from "react-icons/md";

function UserProfile() {
  const { username } = useParams();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByCurrentUser, setIsBlockedByCurrentUser] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' for Post, 'grid' for PostCard

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${username}`);
        setUser(response.data.user);
        setPosts(response.data.posts);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 403) {
          if (err.response?.data?.message === 'You have blocked this user') {
            setIsBlocked(true);
            setIsBlockedByCurrentUser(true);
          } else if (err.response?.data?.message === 'You are blocked by this user') {
            setIsBlocked(true);
            setIsBlockedByCurrentUser(false);
          }
        } else {
          setError(err.response?.data?.message || 'Error fetching user data');
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  const handleLike = (postId, isLiked) => {
    setPosts(posts.map(post =>
      post._id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
    ));
  };

  const handleSave = (postId, isSaved) => {
    setPosts(posts.map(post =>
      post._id === postId ? { ...post, isSaved } : post
    ));
  };

  const handleComment = (postId, commentCount) => {
    setPosts(posts.map(post =>
      post._id === postId ? { ...post, comments: commentCount } : post
    ));
  };

  const handleShare = (postId) => {
    setPosts(posts.map(post =>
      post._id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const handleReport = async (postId, reason, message) => {
    try {
      await api.post(`/posts/${postId}/report`, { reason, message });
      alert(`Reported post ${postId}: ${reason} - ${message}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error reporting post');
    }
  };

  const handleBlock = async () => {
    try {
      await api.post(`/users/block/${user._id}`);
      setIsBlocked(true);
      setIsBlockedByCurrentUser(true);
      alert(`User ${username} blocked`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error blocking user');
    }
  };

  const handleUnblock = async () => {
    try {
      await api.post(`/users/unblock/${user._id}`);
      setIsBlocked(false);
      setIsBlockedByCurrentUser(false);
      const response = await api.get(`/users/${username}`);
      setUser(response.data.user);
      setPosts(response.data.posts);
      alert(`User ${username} unblocked`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error unblocking user');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4 text-center text-theme">Loading...</div>;
  }

  if (isBlocked) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-center text-theme">
          {isBlockedByCurrentUser ? 'You have blocked this user.' : 'You are blocked by this user.'}
        </p>
        {isBlockedByCurrentUser && (
          <div className="text-center mt-4">
            <button
              onClick={handleUnblock}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Unblock User
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-center text-theme">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="avatar"
              className="h-16 w-16 rounded-full mr-4 object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-theme">{user.name}</h2>
              <p className="text-gray-500">@{user.username}</p>
              <p className="text-theme">{user.bio || 'No bio provided'}</p>
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
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'text-theme bg-[#ffffff33]' : 'text-gray-500'}`}
          >
            <MdFormatListBulleted className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'text-theme bg-[#ffffff33]' : 'text-gray-500'}`}
          >
            <MdFeaturedPlayList className="h-5 w-5" />
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {posts.length === 0 ? (
          <p className="text-center text-theme">No posts available</p>
        ) : (
          posts.map(post => (
            viewMode === 'list' ? (
              <Post
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onReport={handleReport}
                isOwnPost={post.author._id.toString() === localStorage.getItem('userId')}
                onDelete={() => {}}
                onArchive={() => {}}
                onRestrictComments={() => {}}
              />
            ) : (
              <PostCard
                key={post._id}
                post={post}
                onClick={() => window.location.href = `/post/${post._id}`}
              />
            )
          ))
        )}
      </div>
    </div>
  );
}

export default UserProfile;