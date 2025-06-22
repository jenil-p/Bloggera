import { FiFileText } from 'react-icons/fi';
import { useState } from 'react';
import api from '../../utils/api';
import '../../index.css';

export default function CategorySidebar({ categories, selectedCategory, onSelectCategory, onCategoriesUpdate }) {
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSuggestCategory = async () => {
    if (!suggestedCategory) {
      setError('Please enter a category name to suggest');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/categories/suggest', { name: suggestedCategory });
      onCategoriesUpdate(response.data.category);
      setSuggestedCategory('');
      alert('Category suggestion submitted for review');
    } catch (err) {
      setError(err.response?.data?.message || 'Error suggesting category');
    }
    setLoading(false);
  };

  return (
    <div className="h-full background scrollbar-hide overflow-y-auto max-sm:pb-10">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Categories</h3>
        <nav className="mt-4 space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center cursor-pointer hover:bg-[#62616138] px-4 py-2 rounded-lg transition-colors ${selectedCategory === null
                ? 'border border-theme text-theme'
                : 'text-theme'
              }`}
          >
            <FiFileText className="mr-3 text-lg" />
            <span>All Categories</span>
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`w-full flex items-center cursor-pointer hover:bg-[#62616138] px-4 py-2 rounded-lg transition-colors ${selectedCategory === category._id
                  ? 'border border-theme text-theme'
                  : 'text-theme'
                }`}
            >
              <FiFileText className="mr-3 text-lg" />
              <span>{category.name}</span>
            </button>
          ))}
          <div className="flex flex-col gap-3 mt-6 mb-4 p-4 background rounded-xl shadow-md">
            <input
              type="text"
              value={suggestedCategory}
              onChange={(e) => setSuggestedCategory(e.target.value)}
              placeholder="Suggest category"
              className="w-full px-4 py-2 border border-theme rounded-lg bg-card text-theme focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSuggestCategory}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={loading || !suggestedCategory}
            >
              Suggest
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}