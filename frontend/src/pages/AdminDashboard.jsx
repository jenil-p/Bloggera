// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import Post from '../components/Post';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [reports, setReports] = useState([
    { id: 1, postId: 1, reason: 'Spam', message: 'This post is spammy', reportedBy: 'user1' },
  ]);
  const [users, setUsers] = useState([
    { username: 'user1', status: 'active' },
  ]);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: { name: 'John Doe', username: 'johndoe', avatar: 'https://via.placeholder.com/40' },
      content: 'This is a problematic post',
      image: null,
      likes: 10,
      comments: 5,
      shares: 2,
      isLiked: false,
      isSaved: false,
    },
  ]);

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
    setReports(reports.filter(report => report.postId !== postId));
  };

  const handleBlockUser = (username) => {
    setUsers(users.map(user =>
      user.username === username ? { ...user, status: 'blocked' } : user
    ));
  };

  const handleSuspendUser = (username) => {
    setUsers(users.map(user =>
      user.username === username ? { ...user, status: 'suspended' } : user
    ));
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin Dashboard</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Reported Posts</h2>
            {reports.map(report => (
              <div key={report.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                <p className="text-gray-700 dark:text-gray-200">Post ID: {report.postId}</p>
                <p className="text-gray-700 dark:text-gray-200">Reason: {report.reason}</p>
                <p className="text-gray-700 dark:text-gray-200">Message: {report.message}</p>
                <p className="text-gray-500 dark:text-gray-400">Reported by: {report.reportedBy}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleDeletePost(report.postId)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete Post
                  </button>
                  <Link
                    to={`/user/${posts.find(post => post.id === report.postId)?.author.username}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View User
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Manage Users</h2>
            {users.map(user => (
              <div key={user.username} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                <p className="text-gray-700 dark:text-gray-200">Username: {user.username}</p>
                <p className="text-gray-700 dark:text-gray-200">Status: {user.status}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleBlockUser(user.username)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={user.status === 'blocked'}
                  >
                    Block
                  </button>
                  <button
                    onClick={() => handleSuspendUser(user.username)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    disabled={user.status === 'suspended'}
                  >
                    Suspend
                  </button>
                  <Link
                    to={`/user/${user.username}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">All Posts</h2>
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
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;