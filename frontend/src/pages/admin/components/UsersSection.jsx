import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { BiSelectMultiple } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";

export default function UsersSection({ users, onActionClick, currentUserId }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== id) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.filter(u => u._id !== currentUserId).length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.filter(u => u._id !== currentUserId).map(u => u._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length > 0) {
      onActionClick({ type: 'delete_users', userIds: selectedUsers });
      setSelectedUsers([]);
      setIsSelectionMode(false);
    }
  };

  const handleDeleteAll = () => {
    onActionClick({ type: 'delete_users', userIds: [], deleteAllUsers: true });
    setSelectedUsers([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedUsers([]); // Clear selections when toggling
  };

  return (
    <div className="divide-y divide-gray-200">
      <div className="flex justify-between items-center p-6 bg-card rounded-t-lg shadow-sm">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-theme">Users</h2>
        </div>
        <div className="flex items-center space-x-4">
          {!isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="px-4 py-2 cursor-pointer text-blue-500 hover:underline"
            >
              Select
            </button>
          ) : (
            <>
              <button
                onClick={handleSelectAll}
                className="px-1 py-2 cursor-pointer"
              >
                <BiSelectMultiple />

              </button>
              <button
                onClick={toggleSelectionMode}
                className="px-1 py-2 cursor-pointer"
              >
                <FiX />
              </button>
              {selectedUsers.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-1 py-2 flex justify-center items-center text-red-600 cursor-pointer"
                >
                  <MdOutlineDelete className='w-5 h-5' /> ({selectedUsers.length})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="px-1 py-2 text-red-600 cursor-pointer "
              >
                Delete All
              </button>
            </>
          )}
        </div>
      </div>
      {users.map(user => (
        <div key={user._id} className="p-6 flex justify-between items-center transition-colors duration-150">
          <div className="flex items-center">
            {isSelectionMode && (
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => handleSelectUser(user._id)}
                disabled={user._id === currentUserId}
                className="mr-4 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            )}
            <Link
              to={`/user/${user.username}`}
              className="flex items-center text-sm font-medium text-theme hover:underline"
            >
              <img
                className="h-8 w-8 rounded-full mr-2 object-cover"
                src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${user.avatar}`}
                alt={user.username}
              />
              {user.username}
            </Link>
            <span className="ml-4 text-xs text-gray-500">
              {new Date(user.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="space-x-2">
            {user._id !== currentUserId && (
              <>
                <button
                  onClick={() => onActionClick({ type: user.isSuspended ? 'unsuspend_user' : 'suspend_user', targetId: user._id })}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 text-sm font-medium px-3 py-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors duration-150"
                >
                  {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
                <button
                  onClick={() => onActionClick({ type: 'block_user', targetId: user._id })}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 text-sm font-medium px-3 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-150"
                >
                  Block
                </button>
                <button
                  onClick={() => onActionClick({ type: 'delete_user', targetId: user._id })}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-150"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}