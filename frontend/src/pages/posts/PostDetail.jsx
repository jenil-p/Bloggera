import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Post from './Post';
import RelatedPostsSidebar from './RelatedPostsSidebar';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching post');
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = (postId, isLiked, likes) => {
    setPost({ ...post, isLiked, likes });
  };

  const handleSave = (postId, isSaved) => {
    setPost({ ...post, isSaved });
  };

  const handleDelete = () => {
    window.location.href = '/home';
  };

  const handleComment = (postId, commentCount) => {
    setPost({ ...post, comments: commentCount });
  };

  const handleReport = (postId, reason, message) => {
    alert(`Reported post ${postId}: ${reason} - ${message}`);
  };

  const handleArchive = (postId, isArchived) => {
    setPost({ ...post, isArchived });
  };

  const handleRestrictComments = (postId, restrictComments) => {
    setPost({ ...post, restrictComments });
  };

  if (loading) {
    return <p className="text-center text-theme">Loading post...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!post) {
    return <p className="text-center text-theme">Post not found</p>;
  }

  return (
    <>
      <div className="md:hidden max-sm:backdrop-blur-sm sticky top-0 sm:top-20 z-30 shadow-sm p-4 flex justify-between items-center">
        <Link to="/home" className="sm:hidden flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Bloggera
          </h1>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex max-lg:flex-col">
        {/* Main Content */}
        <div className="flex-1">
          <Post
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onSave={handleSave}
            onReport={handleReport}
            isOwnPost={post.author._id.toString() === localStorage.getItem('userId')}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onRestrictComments={handleRestrictComments}
          />
        </div>

        {/* Right Sidebar: Related Posts */}
        <div className="w-1/4 max-lg:w-full lg:pl-4">
          <RelatedPostsSidebar
            currentPostId={id}
            categories={post.categories?.map(cat => cat._id) || []}
            tags={post.tags || []}
          />
        </div>
      </div>
    </>
  );
}

export default PostDetail;