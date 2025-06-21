import { useState, useEffect } from 'react';
import api from '../../../utils/api';

export default function ActionModal({ type, targetId, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [affectedPosts, setAffectedPosts] = useState(null);
  const [loading, setLoading] = useState(false);

  const actionTitles = {
    delete_post: 'Delete Post',
    block_user: 'Block User',
    suspend_user: 'Suspend User',
    unsuspend_user: 'Unsuspend User',
    resolve_report: 'Resolve Report',
    dismiss_report: 'Dismiss Report',
    create_category: 'Create New Category',
    approve_category: 'Approve Category',
    reject_category: 'Reject Category',
    delete_category: 'Delete Category',
  };

  // Fetch the number of posts affected by category deletion
  useEffect(() => {
    if (type === 'delete_category') {
      const fetchAffectedPosts = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/posts?category=${targetId}`);
          setAffectedPosts(response.data.length);
        } catch (err) {
          console.error('Error fetching affected posts:', err);
          setAffectedPosts(0);
        } finally {
          setLoading(false);
        }
      };
      fetchAffectedPosts();
    }
  }, [type, targetId]);

  const handleConfirm = () => {
    if (['approve_category', 'reject_category'].includes(type)) {
      onConfirm(type, targetId);
    } else if (type === 'suspend_user' && !durationDays) {
      alert('Please specify suspension duration');
      return;
    } else if (type === 'create_category' && !reason) {
      alert('Please enter a category name');
      return;
    } else if (!['approve_category', 'reject_category'].includes(type) && !reason) {
      alert('Please provide a reason');
      return;
    }
    if (type === 'delete_category' && affectedPosts > 0) {
      if (!window.confirm(`This will reassign ${affectedPosts} post${affectedPosts === 1 ? '' : 's'} to the General category. Proceed?`)) {
        return;
      }
    }
    onConfirm(type, targetId, reason, durationDays);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-theme mb-4">{actionTitles[type]}</h2>
        {type === 'delete_category' && affectedPosts !== null && (
          <p className="text-sm text-gray-500 mb-4">
            {loading ? 'Checking affected posts...' : `${affectedPosts} post${affectedPosts === 1 ? '' : 's'} will be reassigned to the General category.`}
          </p>
        )}
        {type === 'create_category' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme mb-2">Category Name</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-theme rounded bg-card text-theme"
              placeholder="Enter category name"
            />
          </div>
        ) : !['approve_category', 'reject_category'].includes(type) ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-theme rounded bg-card text-theme"
              placeholder="Enter reason for this action"
              rows="4"
            />
          </div>
        ) : null}
        {type === 'suspend_user' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme mb-2">Suspension Duration (days)</label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full p-2 border border-theme rounded bg-card text-theme"
              placeholder="Enter duration in days"
              min="1"
            />
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-theme rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}