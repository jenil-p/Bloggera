// src/pages/Profile.jsx
import { useState } from 'react';
import Post from '../components/Post';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Profile() {
  const { theme } = useTheme();
  const [user, setUser] = useState({
    name: 'Current User',
    username: 'currentuser',
    avatar: 'https://via.placeholder.com/40',
    bio: 'Welcome to my profile!',
  });
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: { name: 'Current User', username: 'currentuser', avatar: 'https://via.placeholder.com/40' },
      content: 'This is my first post on Bloggera!',
      image: null,
      likes: 10,
      comments: 5,
      shares: 2,
      isLiked: false,
      isSaved: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState('posts');
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [comments, setComments] = useState([{ id: 1, postId: 1, content: 'Great post!' }]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Profile updated');
  };

  const handleLike = (postId, isLiked) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
    ));
    if (isLiked) {
      setLikedPosts([...likedPosts, posts.find(post => post.id === postId)]);
    } else {
      setLikedPosts(likedPosts.filter(post => post.id !== postId));
    }
  };

  const handleSave = (postId, isSaved) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isSaved } : post
    ));
    if (isSaved) {
      setSavedPosts([...savedPosts, posts.find(post => post.id === postId)]);
    } else {
      setSavedPosts(savedPosts.filter(post => post.id !== postId));
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <img src={user.avatar} alt="avatar" className="h-16 w-16 rounded-full mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-theme">{user.name}</h2>
            <p className="text-gray-500">@{user.username}</p>
            <p className="text-theme">{user.bio}</p>
          </div>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            placeholder="Name"
            className="w-full p-2 border border-theme rounded bg-card text-theme"
          />
          <input
            type="text"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder="Username"
            className="w-full p-2 border border-theme rounded bg-card text-theme"
          />
          <textarea
            value={user.bio}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            placeholder="Bio"
            className="w-full p-2 border border-theme rounded bg-card text-theme"
            rows="3"
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Profile
          </button>
        </form>
      </div>
      <div className="flex border-b border-theme mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 ${activeTab === 'comments' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`px-4 py-2 ${activeTab === 'liked' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Liked
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 ${activeTab === 'saved' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Saved
        </button>
      </div>
      {activeTab === 'posts' && (
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
              isOwnPost={true}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-card p-4 rounded-lg shadow-md">
              <p className="text-theme">{comment.content}</p>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          {likedPosts.map(post => (
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
      )}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPosts.map(post => (
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
      )}
    </div>
  );
}

export default Profile;