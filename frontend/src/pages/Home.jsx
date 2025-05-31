// src/pages/Home.jsx
import { useState } from 'react';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { useTheme } from '../context/ThemeContext';

function Home() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: { name: 'John Doe', username: 'johndoe', avatar: 'https://via.placeholder.com/40' },
      content: 'This is my first post on Bloggera!',
      image: null,
      likes: 10,
      comments: 5,
      shares: 2,
      isLiked: false,
      isSaved: false,
    },
  ]);

  const handleCreatePost = (newPost) => {
    setPosts([
      {
        id: posts.length + 1,
        author: { name: 'Current User', username: 'currentuser', avatar: 'https://via.placeholder.com/40' },
        content: newPost.content,
        image: newPost.image ? URL.createObjectURL(newPost.image) : null,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isSaved: false,
      },
      ...posts,
    ]);
  };

  const handleLike = (postId, isLiked) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post
    ));
  };

  const handleSave = (postId, isSaved) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isSaved } : post
    ));
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <CreatePost onCreate={handleCreatePost} />
      <div className="space-y-4">
        {posts.map(post => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={() => alert('Comment functionality to be implemented')}
            onShare={() => alert('Share functionality to be implemented')}
            onSave={handleSave}
            onReport={(id, reason, message) => alert(`Reported post ${id}: ${reason} - ${message}`)}
            isOwnPost={post.author.username === 'currentuser'}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;