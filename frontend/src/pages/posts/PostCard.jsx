import { Link } from 'react-router-dom';
import { extractTextFromTiptapJSON } from '../../utils/tiptapUtils';
import '../../index.css';

export default function PostCard({ post, onClick }) {
  const previewText = extractTextFromTiptapJSON(post.content);

  return (
    <div
      onClick={onClick}
      className="group bg-theme rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-card hover:border-cyan-500"
    >
      {post.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={post.image}
            alt={post.title || 'Post image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-xl font-bold text-theme line-clamp-2 mb-3">
          {post.title || (previewText ? previewText : 'Untitled Post')}
        </h3>
        {previewText && (
          <p className="text-theme line-clamp-3 mb-4">
            {previewText}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories?.map(category => (
            <Link
              key={category._id}
              to={`/posts?category=${category._id}`}
              className="text-xs px-3 py-1 tag rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center">
          <img
            src={`http://localhost:3000${post.author.avatar}`}
            alt={post.author.username}
            className="h-10 w-10 rounded-full mr-3 object-cover border-2 border-cyan-500"
          />
          <div>
            <p className="font-medium text-theme">
              @{post.author.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}