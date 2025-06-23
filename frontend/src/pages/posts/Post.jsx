import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { FiMenu, FiX, FiPlus, FiFileText } from 'react-icons/fi';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import CommentSection from '../../components/CommentSection';
import ErrorBoundary from '../../components/ErrorBoundary';
import api from '../../utils/api';
import './LexicalEditor.css';
import '../../index.css'

function Post({
  post,
  onLike,
  onComment,
  onSave,
  onReport,
  isOwnPost,
  onDelete,
  onArchive,
  onRestrictComments,
}) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      LinkExtension.configure({
        openOnClick: true,
      }),
      ImageExtension,
      TextStyle,
      Color,
      FontFamily,
    ],
    content: post.content ? JSON.parse(post.content) || '' : '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none',
      },
    },
  });

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      setIsLiked(response.data.isLiked);
      onLike(post._id, response.data.isLiked, response.data.likes);
    } catch (err) {
      setError(err.response?.data?.message || 'Error liking post');
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/save`);
      setIsSaved(response.data.isSaved);
      onSave(post._id, response.data.isSaved);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving post');
    }
  };

  const handleCopyLink = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/post/${post._id}`).then(() => {
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
      alert('Post reported successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error reporting post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${post._id}`);
        onDelete(post._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting post');
      }
    }
  };

  const handleArchive = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/archive`);
      onArchive(post._id, response.data.isArchived);
      setShowMenu(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error archiving post');
    }
  };

  const handleRestrictComments = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/restrict-comments`);
      onRestrictComments(post._id, response.data.restrictComments);
      setShowMenu(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error restricting comments');
    }
  };

  const handleBlockUser = async () => {
    try {
      await api.post(`/users/block/${post.author._id}`);
      alert(`User ${post.author.username} blocked`);
      setShowMenu(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error blocking user');
    }
  };

  return (
    <>
      <div className="bg-card shadow-md rounded-lg p-4 mb-4 border border-theme">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex items-center justify-between mb-4">
          <Link to={`/user/${post.author.username}`} className="flex items-center">
            <img
              src={post.author.avatar || "/default-avatar.png"}
              alt="avatar"
              className="h-10 w-10 rounded-full mr-3 object-cover"
            />
            <div>
              <p className="font-bold text-theme">{post.author?.name || 'Anonymous'}</p>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
            </div>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-[#62616138] text-theme"
            >
              <EllipsisHorizontalIcon className="h-6 w-6" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-theme rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {isOwnPost ? (
                    <>
                      <button
                        onClick={handleDelete}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#62616138]"
                      >
                        Delete Post
                      </button>
                      <button
                        onClick={handleArchive}
                        className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#62616138]"
                      >
                        {post.isArchived ? 'Unarchive Post' : 'Archive Post'}
                      </button>
                      <button
                        onClick={handleRestrictComments}
                        className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#62616138]"
                      >
                        {post.restrictComments ? 'Allow Comments' : 'Restrict Comments'}
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#62616138]"
                      >
                        Copy Link
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowReportModal(true);
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#62616138]"
                      >
                        Report
                      </button>
                      <button
                        onClick={handleBlockUser}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#62616138]"
                      >
                        Block User
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="block w-full text-left px-4 py-2 text-sm text-theme hover:bg-[#62616138]"
                      >
                        Copy Link
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="post-content text-theme mb-4 custom-scrollbar">
          <ErrorBoundary>
            {editor && <EditorContent editor={editor} />}
          </ErrorBoundary>
        </div>

        {post.image && (
          <div className="mb-4">
            <img
              src={post.image || "/default-image.png"}
              alt="Post image"
              className="rounded-lg border border-theme object-cover w-full"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block tag text-xs px-2 py-1 rounded-full mr-2 mb-2"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <div className="flex space-x-4">
            <button onClick={handleLike} className="flex items-center space-x-1">
              {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
              <span>{post.likes}</span>
            </button>
            <button onClick={() => setShowCommentModal(true)} className="flex items-center space-x-1">
              <ChatBubbleOvalLeftIcon className="h-5 w-5" />
              <span>{post.comments}</span>
            </button>
            <button onClick={handleSave} className="flex items-center space-x-1">
              {isSaved ? <BookmarkIconSolid className="h-5 w-5 text-blue-500" /> : <BookmarkIcon className="h-5 w-5" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {showReportModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full shadow-lg border border-theme">
              <h3 className="text-lg font-bold mb-4 text-theme">Report Post</h3>
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium mb-1 text-theme">Reason</label>
                <select
                  id="reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-theme rounded bg-card text-theme"
                >
                  <option value="">Select a reason</option>
                  <option value="Spam">Spam</option>
                  <option value="Hate Speech">Hate Speech</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Nudity or pornography">Nudity or pornography</option>
                  <option value="Violence">Violence</option>
                  <option value="Misinformation">Misinformation</option>
                  <option value="Self-harm">Self-harm</option>
                  <option value="Intellectual property violation">Intellectual property violation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <textarea
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                placeholder="Additional details (optional)"
                className="w-full p-2 mb-4 border border-theme rounded bg-card text-theme min-h-[100px]"
                rows="4"
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-theme"
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

        {showCommentModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full shadow-lg border border-theme">
              <h3 className="text-lg font-bold mb-4 text-theme">Comments</h3>
              <CommentSection
                postId={post._id}
                isOwnPost={isOwnPost}
                onDeleteComment={() => onComment(post._id, post.comments - 1)}
              />
              <button
                onClick={() => setShowCommentModal(false)}
                className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded w-full text-theme"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Post;