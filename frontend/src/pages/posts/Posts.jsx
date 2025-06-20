import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from './PostCard';
import CategorySidebar from './CategorySidebar';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

function Posts() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams();
        if (selectedCategory) query.append('category', selectedCategory);
        const tag = searchParams.get('tag');
        if (tag) query.append('tag', tag);

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

  return (
    <div className="max-w-7xl mx-auto p-4 flex">
      <div className="w-1/4 pr-4 hidden md:block">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      <div className="flex-1">
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <p className="text-center text-theme">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-theme">No posts found for this tag</p>
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

export default Posts;