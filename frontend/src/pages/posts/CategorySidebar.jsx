export default function CategorySidebar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="bg-card rounded-lg shadow p-4">
      <h3 className="text-lg font-bold text-theme mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-2 py-1 rounded-lg ${selectedCategory === null ? 'bg-blue-500 text-white' : 'text-theme hover:bg-gray-200'}`}
          >
            All Categories
          </button>
        </li>
        {categories.map(category => (
          <li key={category._id}>
            <button
              onClick={() => onSelectCategory(category._id)}
              className={`w-full text-left px-2 py-1 rounded-lg ${selectedCategory === category._id ? 'bg-blue-500 text-white' : 'text-theme hover:bg-gray-200'}`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}