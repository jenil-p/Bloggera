// src/components/Post.jsx
import { useState } from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon, BookmarkIcon, FlagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

function Post({ post, onLike, onComment, onShare, onSave, onReport, isOwnPost, onDelete }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id, !isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(post.id, !isSaved);
  };

  const handleReport = () => {
    onReport(post.id, reportReason, reportMessage);
    setShowReportModal(false);
    setReportReason('');
    setReportMessage('');
  };

  return (
    <div className="bg-card border border-card p-4 rounded-lg shadow-md mb-4 max-w-2xl mx-auto">
      <div className="flex items-center mb-2">
        <img src='profile.jpg' alt="avatar" className="h-10 w-10 object-cover rounded-full mr-2" />
        {/* <img src={post.author.avatar} alt="avatar" className="h-10 w-10 rounded-full mr-2" /> */}
        <div>
          <Link to={`/user/${post.author.username}`} className="font-bold text-theme">{post.author.name}</Link>
          <p className="text-gray-500 text-sm">@{post.author.username}</p>
        </div>
      </div>
      <p className="text-theme mb-4">{post.content}</p>
      {post.image && <img src={post.image} alt="post" className="w-full h-auto rounded-lg mb-4" />}
      <div className="flex justify-between text-gray-500">
        <button onClick={handleLike} className="flex items-center space-x-1 hover:text-red-500">
          {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
          <span>{post.likes}</span>
        </button>
        <button onClick={() => onComment(post.id)} className="flex items-center space-x-1 hover:text-blue-500">
          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          <span>{post.comments}</span>
        </button>
        <button onClick={() => onShare(post.id)} className="flex items-center space-x-1 hover:text-green-500">
          <ShareIcon className="h-5 w-5" />
          <span>{post.shares}</span>
        </button>
        <button onClick={handleSave} className="flex items-center space-x-1 hover:text-yellow-500">
          {isSaved ? <BookmarkIconSolid className="h-5 w-5 text-yellow-500" /> : <BookmarkIcon className="h-5 w-5" />}
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        <button onClick={() => setShowReportModal(true)} className="flex items-center space-x-1 hover:text-orange-500">
          <FlagIcon className="h-5 w-5" />
          <span>Report</span>
        </button>
        {isOwnPost && (
          <button onClick={() => onDelete(post.id)} className="text-red-500 hover:text-red-700">Delete</button>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
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
                className="px-4 py-2 bg-gray-200 hover-bg-theme rounded"
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
    </div>
  );
}

export default Post;