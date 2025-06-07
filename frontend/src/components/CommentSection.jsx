import { useState, useEffect } from 'react';
import api from '../utils/api';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

function CommentSection({ postId, isOwnPost, onDeleteComment }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/${postId}`);
        setComments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching comments');
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    try {
      const response = await api.post(`/comments/${postId}`, { content: newComment });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
      onDeleteComment();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting comment');
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-bold text-theme mb-2">Comments</h4>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {loading ? (
        <p className="text-theme">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-theme">No comments yet</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {comments.map(comment => (
            <div key={comment._id} className="bg-card p-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    // src={comment.author.avatar || 'https://via.placeholder.com/40'}
                    src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${comment.author.avatar}`}
                    alt="avatar"
                    className="h-6 w-6 rounded-full mr-2 object-cover"
                  />
                  <p className="text-sm text-theme">
                    <span className="font-bold">{comment.author.name}</span> @{comment.author.username}
                  </p>
                </div>
                {(isOwnPost || comment.author._id.toString() === userId) && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-theme text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleAddComment} className="mt-2 flex items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-2 border border-theme rounded bg-card text-theme"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Post
        </button>
      </form>
    </div>
  );
}

export default CommentSection;