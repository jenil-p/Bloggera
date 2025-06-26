import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineDelete } from "react-icons/md";
import { BiSelectMultiple } from "react-icons/bi";
import { FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { FaUserAltSlash, FaUserCheck } from "react-icons/fa";

export default function UsersSection({ users, onActionClick, currentUserId }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [expanded, setExpanded] = useState({});

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const eligibleUsers = users.filter(u => u._id !== currentUserId).map(u => u._id);
    setSelectedUsers(selectedUsers.length === eligibleUsers.length ? [] : eligibleUsers);
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
    setSelectedUsers([]);
  };

  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-card rounded-t-lg shadow-sm">
        <h2 className="text-lg font-semibold text-theme">Users</h2>
        <div className="flex items-center space-x-4">
          {!isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="px-4 py-2 text-blue-500 hover:underline"
            >
              Select
            </button>
          ) : (
            <>
              <button onClick={handleSelectAll}><BiSelectMultiple /></button>
              <button onClick={toggleSelectionMode}><FiX /></button>
              {selectedUsers.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="text-red-600 flex items-center"
                >
                  <MdOutlineDelete className='w-5 h-5' /> ({selectedUsers.length})
                </button>
              )}
              <button onClick={handleDeleteAll} className="text-red-600">Delete All</button>
            </>
          )}
        </div>
      </div>

      {/* USERS - Responsive */}
      {users.map(user => (
        <div key={user._id} className="border rounded-lg my-2">
          {/* Mobile View */}
          <div className="sm:hidden p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {isSelectionMode && (
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                    disabled={user._id === currentUserId}
                    className="mr-2"
                  />
                )}
                <img src={user.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full mr-2" alt={user.username} />
                <Link to={`/user/${user.username}`} className="text-theme font-medium hover:underline">{user.username}</Link>
              </div>
              <button onClick={() => toggleExpanded(user._id)}>
                {expanded[user._id] ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            {expanded[user._id] && (
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                {user._id !== currentUserId && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => onActionClick({ type: user.isSuspended ? 'unsuspend_user' : 'suspend_user', targetId: user._id })}
                      className="px-2 py-1 flex justify-center items-center text-xs rounded bg-yellow-100 text-yellow-800"
                    >
                      {user.isSuspended && <><FaUserCheck className='h-4 w-4' /> Unsuspend</>}
                      {!user.isSuspended && <><FaUserAltSlash className='h-4 w-4' /> Suspend</>}
                    </button>
                    <button
                      onClick={() => onActionClick({ type: 'delete_user', targetId: user._id })}
                      className="px-2 py-1 flex justify-center items-center text-xs rounded bg-red-100 text-red-800"
                    >
                      <MdDelete className='h-4 w-4' /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:flex justify-between items-center p-4 hover:bg-gray-50 transition">
            <div className="flex items-center">
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleSelectUser(user._id)}
                  disabled={user._id === currentUserId}
                  className="mr-4 h-5 w-5"
                />
              )}
              <img src={user.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full mr-2" alt={user.username} />
              <Link to={`/user/${user.username}`} className="text-sm font-medium text-theme hover:underline">
                {user.username}
              </Link>
              <span className="ml-4 text-xs text-gray-500">{new Date(user.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {user._id !== currentUserId && (
                <>
                  <button
                    onClick={() => onActionClick({ type: user.isSuspended ? 'unsuspend_user' : 'suspend_user', targetId: user._id })}
                    className={`${user.isSuspended ? 'text-green-600 hover:text-green-900 hover:bg-green-100' : 'text-red-600 hover:text-red-900 hover:bg-red-100'} text-sm px-3 py-1 flex justify-center items-center gap-1 rounded transition`}
                  >
                    {user.isSuspended && <><FaUserCheck className='h-4 w-4' /> Unsuspend</>}
                    {!user.isSuspended && <><FaUserAltSlash className='h-4 w-4' /> Suspend</>}
                  </button>
                  <button
                    onClick={() => onActionClick({ type: 'delete_user', targetId: user._id })}
                    className="text-red-600 hover:text-red-900 text-sm px-3 py-1 flex justify-center items-center gap-1 rounded hover:bg-red-100 transition"
                  >
                    <MdDelete className='h-4 w-4' /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}