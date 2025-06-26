import { useState } from 'react';
import Post from '../../posts/Post';
import PostCard from '../../posts/PostCard';
import { Link } from 'react-router-dom';
import { MdFormatListBulleted, MdFeaturedPlayList, MdDelete } from "react-icons/md";
import { BiSelectMultiple } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";

export default function PostsSection({ posts, onActionClick }) {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPosts.length > 0) {
      onActionClick({ type: 'delete_posts', postIds: selectedPosts });
      setSelectedPosts([]);
      setIsSelectionMode(false);
    }
  };

  const handleDeleteAll = () => {
    onActionClick({ type: 'delete_posts', postIds: [], deleteAllPosts: true });
    setSelectedPosts([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedPosts([]); // Clear selections when toggling
  };

  return (
    <div>
      <div className="flex justify-between items-center p-6 bg-card rounded-t-lg shadow-sm">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-theme">Posts</h2>
        </div>
        <div className="flex items-center space-x-4">
          {!isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="px-4 py-2 cursor-pointer text-blue-500 hover:underline"
            >
              Select
            </button>
          ) : (
            <>
              <button
                onClick={handleSelectAll}
                className="px-1 py-2 cursor-pointer"
              >
                <BiSelectMultiple />

              </button>
              <button
                onClick={toggleSelectionMode}
                className="px-1 py-2 cursor-pointer"
              >
                <FiX/>
              </button>
              {selectedPosts.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-1 py-2 flex justify-center items-center text-red-600 cursor-pointer"
                >
                  <MdOutlineDelete className='w-5 h-5' /> ({selectedPosts.length})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="px-1 py-2 text-red-600 cursor-pointer "
              >
                Delete All
              </button>
            </>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'text-theme bg-[#ffffff33]' : 'text-gray-500'}`}
            >
              <MdFormatListBulleted className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'text-theme bg-[#ffffff33]' : 'text-gray-500'}`}
            >
              <MdFeaturedPlayList className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'list' ? (
        <div className="divide-y divide-gray-200">
          {posts.map(post => (
            <div key={post._id} className="p-6 transition-colors duration-150">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post._id)}
                      onChange={() => handleSelectPost(post._id)}
                      className="mr-4 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  )}
                  <Link
                    to={`/user/${post.author.username}`}
                    className="flex items-center text-sm font-medium text-theme hover:underline"
                  >
                    <img
                      className="h-8 w-8 rounded-full mr-2 object-cover"
                      src={post.author.avatar || "/default-avatar.png"}
                      alt={post.author.username}
                    />
                    {post.author.username}
                  </Link>
                  <span className="text-xs text-gray-500 ml-10">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => onActionClick({ type: 'delete_post', targetId: post._id })}>
                  <MdDelete className='text-red-600 hover:bg-[#ff7b7b67] cursor-pointer rounded-full h-7 w-7 p-1' />
                </button>
              </div>
              <Post
                post={post}
                onLike={() => { }}
                onComment={() => { }}
                onSave={() => { }}
                onReport={() => { }}
                isOwnPost={false}
                onDelete={() => { }}
                onArchive={() => { }}
                onRestrictComments={() => { }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {posts.map(post => (
            <div key={post._id} className="relative">
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post._id)}
                  onChange={() => handleSelectPost(post._id)}
                  className="absolute top-4 left-4 z-10 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              )}
              <PostCard
                post={post}
                onClick={() => window.location.href = `/post/${post._id}`}
                className="hover:shadow-lg transition-shadow duration-200"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}