import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Post from './Post';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching post');
      }
    };
    fetchPost();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!post) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Post
        post={post}
        onLike={() => {}}
        onComment={() => {}}
        onSave={() => {}}
        onReport={() => {}}
        isOwnPost={false}
        onDelete={() => {}}
        onArchive={() => {}}
        onRestrictComments={() => {}}
      />
    </div>
  );
}

export default PostDetail;