import { Link } from 'react-router-dom';

export default function UsersSection({ users, onActionClick }) {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="background">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-theme uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="background divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(user => (
            
            <tr key={user._id} className="user">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${user.avatar}`} alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-theme">
                      {user.username}
                    </div>
                    <div className="text-sm text-theme">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.isSuspended ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full red">
                    Suspended until {new Date(user.suspendedUntil).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full green">
                    Active
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {!user.isSuspended && (
                    <>
                      <button
                        onClick={() => onActionClick({ type: 'block_user', targetId: user._id })}
                        className="red cursor-pointer rounded-md p-1"
                      >
                        Block
                      </button>
                      <button
                        onClick={() => onActionClick({ type: 'suspend_user', targetId: user._id })}
                        className="yellow cursor-pointer rounded-md p-1"
                      >
                        Suspend
                      </button>
                    </>
                  )}
                  <Link
                    to={`/user/${user.username}`}
                    className="purple rounded-md p-1"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}