import { useState, useEffect } from 'react';
import Post from '../components/Post';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { CameraIcon } from '@heroicons/react/24/outline';

function Profile() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
        setAvatarPreview(userResponse.data.avatar);

        const postsResponse = await api.get('/posts?author=me');
        setPosts(postsResponse.data);

        const archivedPostsResponse = await api.get('/posts?author=me&archived=true');
        setArchivedPosts(archivedPostsResponse.data);

        const commentsResponse = await api.get('/comments?author=me');
        setComments(commentsResponse.data);

        const likedPostsResponse = await api.get('/posts?liked=true');
        setLikedPosts(likedPostsResponse.data);

        const savedPostsResponse = await api.get('/posts?saved=true');
        setSavedPosts(savedPostsResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching profile data');
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('username', user.username);
      formData.append('bio', user.bio || '');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.put('/users/profile', formData);
      setUser(response.data);
      setAvatarPreview(response.data.avatar);
      setAvatarFile(null);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handleLike = (postId, isLiked) => {
    const updatePosts = (posts) =>
      posts.map(post =>
        post._id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
      );
    setPosts(updatePosts(posts));
    setLikedPosts(updatePosts(likedPosts));
    setSavedPosts(updatePosts(savedPosts));
    setArchivedPosts(updatePosts(archivedPosts));
  };

  const handleSave = (postId, isSaved) => {
    const updatePosts = (posts) =>
      posts.map(post => (post._id === postId ? { ...post, isSaved } : post));
    setPosts(updatePosts(posts));
    setLikedPosts(updatePosts(likedPosts));
    setSavedPosts(
      isSaved
        ? [...savedPosts, posts.find(post => post._id === postId) || likedPosts.find(post => post._id === postId)]
        : savedPosts.filter(post => post._id !== postId)
    );
    setArchivedPosts(updatePosts(archivedPosts));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    setArchivedPosts(archivedPosts.filter(post => post._id !== postId));
    setComments(comments.filter(comment => comment.post?._id !== postId));
    setLikedPosts(likedPosts.filter(post => post._id !== postId));
    setSavedPosts(savedPosts.filter(post => post._id !== postId));
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting comment');
    }
  };

  const handleComment = (postId, commentCount) => {
    const updatePosts = (posts) =>
      posts.map(post => (post._id === postId ? { ...post, comments: commentCount } : post));
    setPosts(updatePosts(posts));
    setArchivedPosts(updatePosts(archivedPosts));
    setLikedPosts(updatePosts(likedPosts));
    setSavedPosts(updatePosts(savedPosts));
  };

  const handleReport = async (postId, reason, message) => {
    try {
      await api.post(`/posts/${postId}/report`, { reason, message });
      alert(`Reported post ${postId}: ${reason} - ${message}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error reporting post');
    }
  };

  const handleArchive = (postId, isArchived) => {
    if (isArchived) {
      const post = posts.find(post => post._id === postId);
      if (post) {
        setPosts(posts.filter(post => post._id !== postId));
        setArchivedPosts([...archivedPosts, { ...post, isArchived }]);
      }
    } else {
      const post = archivedPosts.find(post => post._id === postId);
      if (post) {
        setArchivedPosts(archivedPosts.filter(post => post._id !== postId));
        setPosts([...posts, { ...post, isArchived }]);
      }
    }
  };

  const handleRestrictComments = (postId, restrictComments) => {
    const updatePosts = (posts) =>
      posts.map(post => (post._id === postId ? { ...post, restrictComments } : post));
    setPosts(updatePosts(posts));
    setArchivedPosts(updatePosts(archivedPosts));
    setLikedPosts(updatePosts(likedPosts));
    setSavedPosts(updatePosts(savedPosts));
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4 text-center text-theme">Loading...</div>;
  }

  if (!user) {
    return <div className="max-w-4xl mx-auto p-4 text-center text-theme">Error loading profile</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${avatarPreview}`}
                alt="avatar"
                className="h-16 w-16 rounded-full mr-4 object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer">
                  <CameraIcon className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme">{user.name}</h2>
              <p className="text-gray-500">@{user.username}</p>
              <p className="text-theme">{user.bio || 'No bio provided'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 border border-theme rounded bg-card text-theme"
              required
            />
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              placeholder="Username"
              className="w-full p-2 border border-theme rounded bg-card text-theme"
              required
            />
            <textarea
              value={user.bio}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              placeholder="Bio"
              className="w-full p-2 border border-theme rounded bg-card text-theme"
              rows="3"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>
      <div className="flex border-b border-theme mb-4">
        {['posts', 'archived', 'comments', 'liked', 'saved'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-theme">No posts available</p>
          ) : (
            posts.map(post => (
              <Post
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onReport={handleReport}
                isOwnPost={true}
                onDelete={handleDeletePost}
                onArchive={handleArchive}
                onRestrictComments={handleRestrictComments}
              />
            ))
          )}
        </div>
      )}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          {archivedPosts.length === 0 ? (
            <p className="text-center text-theme">No archived posts</p>
          ) : (
            archivedPosts.map(post => (
              <Post
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onReport={handleReport}
                isOwnPost={true}
                onDelete={handleDeletePost}
                onArchive={handleArchive}
                onRestrictComments={handleRestrictComments}
              />
            ))
          )}
        </div>
      )}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-theme">No comments available</p>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="bg-card p-4 rounded-lg shadow-md">
                <p className="text-theme">{comment.content}</p>
                <p className="text-gray-500 text-sm">
                  On post: {comment.post?.content?.substring(0, 50) || 'Post not available'}
                </p>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 hover:text-red-700 mt-2"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          {likedPosts.length === 0 ? (
            <p className="text-center text-theme">No liked posts</p>
          ) : (
            likedPosts.map(post => (
              <Post
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onReport={handleReport}
                isOwnPost={post.author._id.toString() === user._id}
                onDelete={handleDeletePost}
                onArchive={handleArchive}
                onRestrictComments={handleRestrictComments}
              />
            ))
          )}
        </div>
      )}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPosts.length === 0 ? (
            <p className="text-center text-theme">No saved posts</p>
          ) : (
            savedPosts.map(post => (
              <Post
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onReport={handleReport}
                isOwnPost={post.author._id.toString() === user._id}
                onDelete={handleDeletePost}
                onArchive={handleArchive}
                onRestrictComments={handleRestrictComments}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;