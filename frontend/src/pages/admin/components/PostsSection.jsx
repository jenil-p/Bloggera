import Post from '../../../components/Post';
import { Link } from 'react-router-dom';

export default function PostsSection({ posts, onActionClick }) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {posts.map(post => (
        <div key={post._id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link 
                to={`/user/${post.author.username}`}
                className="flex items-center text-sm font-medium text-theme hover:underline"
              >
                <img 
                  className="h-8 w-8 rounded-full mr-2"
                  src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${post.author.avatar}`}
                  alt={post.author.username} 
                />
                {post.author.username}
              </Link>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-10">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onActionClick({ type: 'delete_post', targetId: post._id })}
              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
            >
              Delete
            </button>
          </div>
          
          <Post 
            post={post} 
            onLike={() => {}} 
            onComment={() => {}} 
            onShare={() => {}} 
            onSave={() => {}} 
            onReport={() => {}} 
            isOwnPost={false}
            onDelete={() => {}}
            onArchive={() => {}}
            onRestrictComments={() => {}}
            compactView={true}
          />
        </div>
      ))}
    </div>
  );
}