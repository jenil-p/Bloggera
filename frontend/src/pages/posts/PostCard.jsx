import { Link } from 'react-router-dom';
import { extractTextFromTiptapJSON } from '../../utils/tiptapUtils'
import '../../index.css'

export default function PostCard({ post, onClick }) {
  const previewText = extractTextFromTiptapJSON(post.content);

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden transform hover:-translate-y-1"
    >
      {post.image && (
        <img
          // src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.image}`}
          src={post.image}
          alt={post.title || 'Post image'}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-theme line-clamp-2 mb-2">
          {post.title || (previewText ? previewText : 'Untitled Post')}
        </h3>
        {previewText && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">{previewText}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {post.categories?.map(category => (
            <Link
              key={category._id}
              to={`/posts?category=${category._id}`}
              className="text-xs px-2 py-1 tag rounded-full transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <div className="mt-3 flex items-center">
          <img
            src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.author.avatar}`}
            alt={post.author.username}
            className="h-8 w-8 rounded-full mr-2 object-cover"
          />
          <span className="text-sm font-medium text-theme">@{post.author.username}</span>
        </div>
      </div>
    </div>
  );
}