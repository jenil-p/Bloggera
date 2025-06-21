import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from './posts/PostCard';
import CreatePost from './posts/CreatePost';
import CategorySidebar from './posts/CategorySidebar';
import api from '../utils/api';
import { FiMenu, FiX, FiPlus, FiFileText } from 'react-icons/fi';
import '../index.css';

function Home() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when window resizes above md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // Tailwind's md breakpoint is 768px
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams();
        if (selectedCategory) query.append('category', selectedCategory);
        if (searchParams.get('tag')) query.append('tag', searchParams.get('tag'));

        const [postsRes, categoriesRes] = await Promise.all([
          api.get(`/posts?${query.toString()}`),
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
  }, [selectedCategory, searchParams]);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePostModal(false);
  };

  const handleCategoriesUpdate = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-20 z-30 background shadow-sm p-4 flex justify-between items-center">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Bloggera</h1>
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="p-2 rounded-md bg-blue-600 text-white"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 fixed top-20 bottom-0 border-r border-theme background">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onCategoriesUpdate={handleCategoriesUpdate}
          />
        </div>

        {/* Mobile Sidebar Modal */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 background shadow-xl transform transition-transform duration-300">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Categories</h2>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <nav className="mt-4 overflow-y-auto h-[calc(100%-60px)]">
                <CategorySidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(category) => {
                    setSelectedCategory(category);
                    setMobileSidebarOpen(false);
                  }}
                  onCategoriesUpdate={handleCategoriesUpdate}
                />
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:ml-64">
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {selectedCategory
                ? `Posts in ${categories.find(c => c._id === selectedCategory)?.name || 'Category'}`
                : 'All Posts'}
            </h1>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FiFileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {selectedCategory
                  ? `There are no posts in this category yet. Be the first to create one!`
                  : 'No posts available yet. Create the first post!'}
              </p>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onClick={() => window.location.href = `/post/${post._id}`}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <CreatePost
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handleCreatePost}
      />
    </div>
  );
}

export default Home;