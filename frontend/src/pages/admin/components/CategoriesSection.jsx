import { Link } from 'react-router-dom';

export default function CategoriesSection({ categories, suggestedCategories, onActionClick }) {
  return (
    <div className="p-6">
      <button
        onClick={() => onActionClick({ type: 'create_category' })}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add New Category
      </button>
      <h2 className="text-xl font-bold text-theme mb-4">Approved Categories</h2>
      {categories.length === 0 ? (
        <p className="text-center text-theme">No approved categories available</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {categories.map(category => (
            <div key={category._id} className="py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-theme">{category.name}</h3>
              </div>
              <button
                onClick={() => onActionClick({ type: 'delete_category', targetId: category._id })}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-xl font-bold text-theme mt-6 mb-4">Suggested Categories</h2>
      {suggestedCategories.length === 0 ? (
        <p className="text-center text-theme">No suggested categories available</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {suggestedCategories.map(category => (
            <div key={category._id} className="py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-theme">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  Suggested by: {category.suggestedBy?.username || 'Unknown'} on {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onActionClick({ type: 'approve_category', targetId: category._id })}
                  className="text-green-600 hover:text-green-900 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => onActionClick({ type: 'reject_category', targetId: category._id })}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}