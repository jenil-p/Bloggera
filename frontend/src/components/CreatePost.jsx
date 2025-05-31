// src/components/CreatePost.jsx
import { useState } from 'react';

function CreatePost({ onCreate }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ content, image });
    setContent('');
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg shadow-md mb-6 max-w-2xl mx-auto">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 border border-theme rounded bg-card text-theme mb-4"
        rows="4"
      ></textarea>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4 text-theme"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Post
      </button>
    </form>
  );
}

export default CreatePost;