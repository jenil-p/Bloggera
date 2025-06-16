import { useState, useEffect } from 'react';
import PostCard from './posts/PostCard';
import CreatePost from './posts/CreatePost';
import CategorySidebar from './posts/CategorySidebar';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

function Home() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          api.get(selectedCategory ? `/posts?category=${selectedCategory}` : '/posts'),
          api.get('/categories'),
        ]);
        setPosts(postsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePostModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex">
      {/* Left Sidebar: Categories */}
      <div className="w-1/4 pr-4 hidden md:block">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Post
        </button>
        <CreatePost
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={handleCreatePost}
        />
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <p className="text-center text-theme">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-theme">No posts available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onClick={() => window.location.href = `/post/${post._id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;