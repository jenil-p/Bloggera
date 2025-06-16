import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import CreatePostModal from '../../components/CreatePostModal';
import api from '../../utils/api';
import EmojiPicker from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Underline,
  Code,
  LinkIcon,
  ImageIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Redo,
  Undo,
  Strikethrough,
  Eraser,
  SeparatorHorizontal,
  Minus,
  Sparkles,
} from 'lucide-react';

function CreatePost({ isOpen, onClose, onPostCreated }) {
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: true,
      }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      FontFamily,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 border border-theme rounded md:h-96 max-sm:h-96 text-theme overflow-auto',
      },
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/posts/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const imageUrl = response.data.imageUrl;
      if (editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading image');
    }
    setLoading(false);
  };

  const handleEmojiSelect = (emojiObject) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiObject.emoji).run();
    }
    setShowEmojiPicker(false);
  };

  const handleCategoryToggle = (categoryId) => {
    setCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSuggestCategory = async () => {
    if (!newCategory) {
      setError('Please enter a category name to suggest');
      return;
    }
    setLoading(true);
    try {
      await api.post('/categories/suggest', { name: newCategory });
      alert('Category suggestion submitted for review');
      setNewCategory('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error suggesting category');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!editor) {
      setError('Editor not initialized.');
      return;
    }

    const plainTextContent = editor.getText().trim();
    if (plainTextContent.length === 0) {
      setError('Post content cannot be empty');
      return;
    }

    if (categoryIds.length === 0) {
      setError('At least one category is required');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        content: JSON.stringify(editor.getJSON()),
        tags: JSON.stringify(tags),
        categoryIds: JSON.stringify(categoryIds),
      };

      const response = await api.post('/posts', postData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      onPostCreated(response.data);
      editor.commands.clearContent();
      setTags([]);
      setCategoryIds([]);
      setNewCategory('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <CreatePostModal isOpen={isOpen} onClose={onClose} title="Create New Post">
      <div className="p-4 h-full rounded-lg shadow-lg">
        {editor && (
          <div className="toolbar sticky top-0 z-50 flex flex-wrap space-x-1 p-2 bg-card border-b border-theme rounded-t-lg">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Bold"
            >
              <Bold className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Italic"
            >
              <Italic className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Underline"
            >
              <Underline className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1 rounded ${editor.isActive('strike') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Strikethrough"
            >
              <Strikethrough className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
                }
              }}
              className={`p-1 rounded ${editor.isActive('link') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Insert Link"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              ref={fileInputRef}
            />
            <label htmlFor="image-upload" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer text-theme" title="Upload Image">
              <ImageIcon className="h-5 w-5" />
            </label>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-theme"
              title="Insert Emoji"
            >
              <Sparkles className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Bullet List"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Ordered List"
            >
              <ListOrdered className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1 rounded ${editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Blockquote"
            >
              <Quote className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1 rounded ${editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Code Block"
            >
              <Code className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
              className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Heading 1"
            >
              <Heading1 className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
              className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Heading 2"
            >
              <Heading2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
              className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-theme'}`}
              title="Heading 3"
            >
              <Heading3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-theme"
              title="Undo"
            >
              <Undo className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-theme"
              title="Redo"
            >
              <Redo className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().clearNodes().run()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-theme"
              title="Clear Format"
            >
              <Eraser className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-theme"
              title="Horizontal Rule"
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHardBreak().run()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-theme"
              title="Hard Break"
            >
              <SeparatorHorizontal className="h-5 w-5" />
            </button>
            <input
              type="color"
              onInput={event => editor.chain().focus().setColor(event.target.value).run()}
              value={editor.isActive('textStyle', { color: '#000000' }) ? editor.getAttributes('textStyle').color : '#000000'}
              className="p-1 rounded cursor-pointer w-8 h-8"
              title="Font Color"
            />
            <select
              onChange={event => editor.chain().focus().setFontFamily(event.target.value).run()}
              value={editor.getAttributes('textStyle').fontFamily || ''}
              className="p-1 rounded bg-card text-theme border border-theme"
              title="Font Family"
            >
              <option value="">Default</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
        )}
        <EditorContent editor={editor} className="emojis overflow-auto" />
        <div className="mt-4">
          <label className="block text-sm font-medium text-theme mb-2">Categories (select at least one)</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategoryToggle(category._id)}
                className={`px-3 py-1 rounded-full text-sm ${categoryIds.includes(category._id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-theme hover:bg-gray-300'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium text-theme mb-2">Suggest a New Category</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="w-full p-2 border border-theme rounded bg-card text-theme"
            />
            <button
              type="button"
              onClick={handleSuggestCategory}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading || !newCategory}
            >
              Suggest
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Add tags (comma-separated)"
          className="w-full p-2 sticky bottom-12 z-50 border border-theme rounded bg-card text-theme mt-4"
          onChange={(e) => setTags(e.target.value.split(',').map((tag) => tag.trim()).filter((tag) => tag))}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {showEmojiPicker && (
          <div className="absolute top-32 left-72 z-10">
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </div>
        )}
        <div className="flex sticky bottom-0 z-50 justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-theme"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </CreatePostModal>
  );
}

export default CreatePost;