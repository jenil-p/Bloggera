import { useState } from 'react';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import CommentSection from './CommentSection';

function Post({ post, onLike, onComment, onSave, onReport, isOwnPost, onDelete, onArchive, onRestrictComments }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const userId = localStorage.getItem('userId');

  const handleLike = async () => {
    try {
      await api.post(`/posts/${post._id}/like`);
      setIsLiked(!isLiked);
      onLike(post._id, !isLiked);
    } catch (err) {
      setError(err.response?.data?.message || 'Error liking post');
    }
  };

  const handleSave = async () => {
    try {
      await api.post(`/posts/${post._id}/save`);
      setIsSaved(!isSaved);
      onSave(post._id, !isSaved);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving post');
    }
  };

  const handleCopyLink = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    const postUrl = `${baseUrl}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Link copied to clipboard!');
    }).catch((err) => {
      setError('Failed to copy link');
      console.error('Copy link error:', err);
    });
    setShowMenu(false);
  };

  const handleReport = async () => {
    try {
      await api.post(`/posts/${post._id}/report`, { reason: reportReason, message: reportMessage });
      onReport(post._id, reportReason, reportMessage);
      setShowReportModal(false);
      setReportReason('');
      setReportMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error reporting post');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting post');
    }
  };

  const handleArchive = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/archive`);
      onArchive(post._id, response.data.isArchived);
    } catch (err) {
      setError(err.response?.data?.message || 'Error archiving post');
    }
  };

  const handleRestrictComments = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/restrict-comments`);
      onRestrictComments(post._id, response.data.restrictComments);
    } catch (err) {
      setError(err.response?.data?.message || 'Error restricting comments');
    }
  };

  const handleBlockUser = async () => {
    try {
      await api.post(`/users/block/${post.author._id}`);
      alert(`User ${post.author.username} blocked`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error blocking user');
    }
  };

  return (
    <div className="bg-card border border-card p-4 rounded-lg shadow-md mb-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <img
            src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.author.avatar}`}
            alt="avatar"
            className="h-10 w-10 object-cover rounded-full mr-2"
          />
          <div>
            <Link to={`/user/${post.author.username}`} className="font-bold text-theme">
              {post.author.name}
            </Link>
            <p className="text-gray-500 text-sm">@{post.author.username}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-700">
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-theme rounded-lg shadow-lg z-10">
              {isOwnPost ? (
                <div className="py-1">
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#33323254]"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleArchive}
                    className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#33323254]"
                  >
                    {post.isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    onClick={handleRestrictComments}
                    className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#33323254]"
                  >
                    {post.restrictComments ? 'Allow Comments' : 'Restrict Comments'}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#33323254]"
                  >
                    Copy Link
                  </button>
                </div>
              ) : (
                <div className="py-1">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-theme cursor-pointer hover:bg-[#33323254]"
                  >
                    Report
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-[#33323254]"
                  >
                    Block User
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="block w-full text-left px-4 py-2 text-sm text-theme cursor-pointer hover:bg-[#33323254]"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-theme mb-4">{post.content}</p>
      {post.image && (
        <img
          src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.image}`}
          alt="post"
          className="w-full h-auto rounded-lg mb-4"
        />
      )}
      <div className="flex justify-between text-gray-500">
        <button onClick={handleLike} className="flex items-center space-x-1 hover:text-red-500">
          {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => setShowCommentModal(true)}
          className="flex items-center space-x-1 hover:text-blue-500"
        >
          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          <span>{post.comments}</span>
        </button>
        <button onClick={handleSave} className="flex items-center space-x-1 hover:text-yellow-500">
          {isSaved ? <BookmarkIconSolid className="h-5 w-5 text-yellow-500" /> : <BookmarkIcon className="h-5 w-5" />}
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-theme">Report Post</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 mb-4 border border-theme rounded bg-card text-theme"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Additional details (optional)"
              className="w-full p-2 mb-4 border border-theme rounded bg-card text-theme"
              rows="4"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-theme">Comments</h3>
            <CommentSection
              postId={post._id}
              isOwnPost={isOwnPost}
              onDeleteComment={() => onComment(post._id, post.comments - 1)}
            />
            <button
              onClick={() => setShowCommentModal(false)}
              className="mt-4 px-4 py-2 bg-[#3b3b3b43] rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;