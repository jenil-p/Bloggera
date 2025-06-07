import { useState, useEffect } from 'react';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

function Home() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching posts');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

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

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
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

  const handleReport = (postId, reason, message) => {
    alert(`Reported post ${postId}: ${reason} - ${message}`);
  };

  const handleArchive = (postId, isArchived) => {
    setPosts(posts.map(post =>
      post._id === postId ? { ...post, isArchived } : post
    ));
  };

  const handleRestrictComments = (postId, restrictComments) => {
    setPosts(posts.map(post =>
      post._id === postId ? { ...post, restrictComments } : post
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <CreatePost onCreate={handleCreatePost} />
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <p className="text-center text-theme">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-theme">No posts available</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Post
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onSave={handleSave}
              onReport={handleReport}
              isOwnPost={post.author._id.toString() === localStorage.getItem('userId')}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onRestrictComments={handleRestrictComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;