import { useState } from 'react';
import api from '../utils/api';

function CreatePost({ onCreate }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('content', content);
    if (tags) formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())));
    if (image) formData.append('image', image);

    try {
      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreate(response.data);
      setContent('');
      setImage(null);
      setTags('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg shadow-md mb-6 max-w-2xl mx-auto">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 border border-theme rounded bg-card text-theme mb-4"
        rows="4"
        required
      ></textarea>
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="w-full p-2 border border-theme rounded bg-card text-theme mb-4"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4 text-theme"
      />
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 text-white rounded ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

export default CreatePost;