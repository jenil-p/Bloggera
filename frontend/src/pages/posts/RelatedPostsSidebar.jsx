import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import api from '../../utils/api';

export default function RelatedPostsSidebar({ currentPostId, categories }) {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const query = new URLSearchParams();
        query.append('category', categories.join(','));
        query.append('exclude', currentPostId);
        const response = await api.get(`/posts?${query.toString()}`);
        setRelatedPosts(response.data.slice(0, 5)); // Limit to 5 related posts
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching related posts');
        setLoading(false);
      }
    };
    if (categories.length > 0) {
      fetchRelatedPosts();
    } else {
      setLoading(false);
    }
  }, [categories, currentPostId]);

  if (loading) {
    return <p className="text-center text-theme">Loading related posts...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="bg-card rounded-lg shadow p-4">
      <h3 className="text-lg font-bold text-theme mb-4">Related Posts</h3>
      {relatedPosts.length === 0 ? (
        <p className="text-theme">No related posts found</p>
      ) : (
        <div className="space-y-4">
          {relatedPosts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onClick={() => window.location.href = `/post/${post._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}