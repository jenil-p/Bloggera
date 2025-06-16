import { Link } from 'react-router-dom';

export default function CategoriesSection({ categories, onActionClick }) {
  return (
    <div className="p-6">
      <button
        onClick={() => onActionClick({ type: 'create_category' })}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add New Category
      </button>
      {categories.length === 0 ? (
        <p className="text-center text-theme">No categories available</p>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map(category => (
            <div key={category._id} className="py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-theme">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onActionClick({ type: 'delete_category', targetId: category._id })}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}