import { Link } from 'react-router-dom';

export default function PostCard({ post, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {post.image && (
        <img
          src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.image}`}
          alt={post.title || 'Post image'}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-theme line-clamp-2">{post.title || post.content.substring(0, 50)}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">{post.content}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {post.categories?.map(category => (
            <Link
              key={category._id}
              to={`/posts?category=${category._id}`}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <div className="mt-2 flex items-center">
          <img
            src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.author.avatar}`}
            alt={post.author.username}
            className="h-6 w-6 rounded-full mr-2"
          />
          <span className="text-sm text-theme">{post.author.username}</span>
        </div>
      </div>
    </div>
  );
}