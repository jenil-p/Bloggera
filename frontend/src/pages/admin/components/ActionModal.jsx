import { useState } from 'react';

export default function ActionModal({ type, targetId, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [error, setError] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'delete_post': return 'Delete Post';
      case 'block_user': return 'Block User';
      case 'suspend_user': return 'Suspend User';
      case 'resolve_report': return 'Resolve Report';
      case 'dismiss_report': return 'Dismiss Report';
      default: return 'Confirm Action';
    }
  };

  const handleSubmit = () => {
    if (!reason) {
      setError('Reason is required');
      return;
    }
    if (type === 'suspend_user' && !durationDays) {
      setError('Duration is required');
      return;
    }
    onConfirm(type, targetId, reason, durationDays ? parseInt(durationDays) : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {getTitle()}
          </h3>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for action
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Explain why you're taking this action..."
              />
            </div>
            
            {type === 'suspend_user' && (
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suspension Duration (days)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter number of days"
                  min="1"
                />
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}