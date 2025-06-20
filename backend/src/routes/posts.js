const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const AdminAction = require('../models/AdminAction');
const Category = require('../models/Category');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './Uploads/posts/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
  },
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { content, tags, categoryIds, suggestedCategoryIds } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (!categoryIds) {
      return res.status(400).json({ message: 'At least one approved category is required' });
    }

    // Validate Tiptap/ProseMirror content structure
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid content format (not valid JSON)' });
    }

    if (!parsedContent || parsedContent.type !== 'doc' || !Array.isArray(parsedContent.content)) {
      return res.status(400).json({ message: 'Invalid Tiptap document structure' });
    }

    let hasMeaningfulContent = false;
    if (parsedContent.content.length > 0) {
      for (const node of parsedContent.content) {
        if (node.type === 'image' && node.attrs && node.attrs.src) {
          hasMeaningfulContent = true;
          break;
        }
        if (node.content && Array.isArray(node.content) && node.content.length > 0) {
          if (node.content.some(childNode => childNode.type === 'text' && childNode.text.trim().length > 0)) {
            hasMeaningfulContent = true;
            break;
          }
        }
        if ((node.type === 'bulletList' || node.type === 'orderedList') && node.content && node.content.length > 0) {
          if (node.content.some(listItem =>
            listItem.type === 'listItem' &&
            Array.isArray(listItem.content) &&
            listItem.content.length > 0 &&
            listItem.content.some(para =>
              para.content &&
              Array.isArray(para.content) &&
              para.content.some(textNode =>
                textNode.type === 'text' && textNode.text.trim().length > 0
              )
            )
          )) {
            hasMeaningfulContent = true;
            break;
          }
        }
      }
    }

    if (!hasMeaningfulContent) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    // Validate approved categoryIds
    let parsedCategoryIds;
    try {
      parsedCategoryIds = JSON.parse(categoryIds);
      if (!Array.isArray(parsedCategoryIds) || parsedCategoryIds.length === 0) {
        return res.status(400).json({ message: 'At least one approved category is required' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid categoryIds format' });
    }

    // Verify all approved categories exist and are approved
    const validCategories = await Category.find({
      _id: { $in: parsedCategoryIds },
      isApproved: true,
    });
    if (validCategories.length !== parsedCategoryIds.length) {
      return res.status(400).json({ message: 'One or more approved categories are invalid or unapproved' });
    }

    // Validate suggested categoryIds (optional)
    let parsedSuggestedCategoryIds = [];
    if (suggestedCategoryIds) {
      try {
        parsedSuggestedCategoryIds = JSON.parse(suggestedCategoryIds);
        if (!Array.isArray(parsedSuggestedCategoryIds)) {
          return res.status(400).json({ message: 'Invalid suggestedCategoryIds format' });
        }
        // Verify suggested categories exist (can be unapproved)
        const validSuggestedCategories = await Category.find({
          _id: { $in: parsedSuggestedCategoryIds },
        });
        if (validSuggestedCategories.length !== parsedSuggestedCategoryIds.length) {
          return res.status(400).json({ message: 'One or more suggested categories are invalid' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid suggestedCategoryIds format' });
      }
    }

    const post = new Post({
      author: req.user._id,
      content,
      image: req.file ? `/Uploads/posts/${req.file.filename}` : null,
      tags: tags ? JSON.parse(tags) : [],
      categories: parsedCategoryIds,
      suggestedCategories: parsedSuggestedCategoryIds,
      likes: [],
      comments: [],
      savedBy: [],
      isArchived: false,
      isDeleted: false,
      restrictComments: false,
    });

    await post.save();
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name')
      .populate('suggestedCategories', 'name');
    res.status(201).json({
      ...populatedPost.toJSON(),
      isLiked: false,
      isSaved: false,
      likes: 0,
      comments: 0,
    });
  } catch (error) {
    console.error('Error creating post:', error.stack);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { author, liked, saved, archived, category, categories, tags, tag, exclude } = req.query;
    const user = await User.findById(req.user._id).select('likedPosts savedPosts blockedUsers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = { isDeleted: false };

    if (archived !== 'true') {
      query.isArchived = false;
    }

    // Exclude posts from blocked users
    query.author = { $nin: user.blockedUsers || [] };

    if (author === 'me') {
      query.author = req.user._id;
    } else if (author) {
      const targetUser = await User.findOne({ username: author });
      if (!targetUser) return res.status(404).json({ message: 'User not found' });
      query.author = targetUser._id;
    }

    if (liked) {
      query._id = { $in: user.likedPosts };
    }

    if (saved) {
      query._id = { $in: user.savedPosts };
    }

    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists || !categoryExists.isApproved) {
        return res.status(404).json({ message: 'Category not found or not approved' });
      }
      query.categories = category;
    }

    if (categories || tags || tag) {
      const orConditions = [];
      if (categories) {
        const categoryArray = categories.split(',').filter(id => mongoose.isValidObjectId(id));
        if (categoryArray.length === 0) {
          return res.status(400).json({ message: 'Invalid category IDs' });
        }
        const validCategories = await Category.find({
          _id: { $in: categoryArray },
          isApproved: true,
        });
        if (validCategories.length !== categoryArray.length) {
          return res.status(400).json({ message: 'One or more categories are invalid or unapproved' });
        }
        orConditions.push({ categories: { $in: categoryArray } });
      }
      if (tags) {
        const tagArray = tags.split(',');
        orConditions.push({ tags: { $in: tagArray } });
      }
      if (tag) {
        orConditions.push({ tags: tag });
      }
      if (orConditions.length > 0) {
        query.$or = orConditions;
      }
    }

    if (exclude && mongoose.isValidObjectId(exclude)) {
      query._id = { $ne: exclude };
    }

    const posts = await Post.find(query)
      .populate('author', 'name username avatar')
      .populate('categories', 'name')
      .populate('suggestedCategories', 'name')
      .sort({ createdAt: -1 });

    res.json(posts.map(post => ({
      ...post.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: user.savedPosts.includes(post._id),
      likes: post.likes.length,
      comments: post.comments.length,
    })));
  } catch (error) {
    console.error('Error fetching posts:', error.stack);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name')
      .where({ isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUser = await User.findById(req.user._id).select('savedPosts');
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    res.json({
      ...post.toJSON(),
      isLiked: post.likes.some(id => id.toString() === req.user._id.toString()),
      isSaved: currentUser.savedPosts.some(id => id.toString() === post._id.toString()),
      likes: post.likes.length,
      comments: post.comments.length,
    });
  } catch (error) {
    console.error('Error fetching post:', error.stack);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const posts = await Post.find({
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { categories: { $in: await Category.find({ name: { $regex: q, $options: 'i' }, isApproved: true }).select('_id') } },
      ],
      isDeleted: false,
      isArchived: false,
    })
      .populate('author', 'name username avatar')
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
    // .limit(20);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      isSuspended: false,
    })
      .select('name username avatar')
    // .limit(20);

    res.json({
      posts: posts.map(post => ({
        ...post.toJSON(),
        isLiked: post.likes.includes(req.user._id),
        isSaved: req.user.savedPosts.includes(post._id),
        likes: post.likes.length,
        comments: post.comments.length,
      })),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching posts', error: error.message });
  }
});

// Like/unlike a post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      await User.findByIdAndUpdate(userId, { $pull: { likedPosts: post._id } });
    } else {
      post.likes.push(userId);
      await User.findByIdAndUpdate(userId, { $addToSet: { likedPosts: post._id } });
    }

    await post.save();
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: !isLiked,
      isSaved: req.user.savedPosts.includes(post._id),
      likes: updatedPost.likes.length,
      comments: updatedPost.comments.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

// Save/unsave a post
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isSaved = req.user.savedPosts.includes(post._id);
    if (isSaved) {
      await User.findByIdAndUpdate(userId, { $pull: { savedPosts: post._id } });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { savedPosts: post._id } });
    }

    const updatedUser = await User.findById(userId).select('-password');
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(userId),
      isSaved: !isSaved,
      likes: post.likes.length,
      comments: post.comments.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving post', error: error.message });
  }
});

// Report a post
router.post('/:id/report', authMiddleware, async (req, res) => {
  try {
    const { reason, message } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const report = new Report({
      post: post._id,
      reportedBy: req.user._id,
      reason,
      message,
    });

    await report.save();
    res.status(201).json({ message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error reporting post', error: error.message });
  }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    post.isDeleted = true;
    await post.save();

    await Comment.updateMany({ post: post._id, isDeleted: false }, { isDeleted: true });

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'delete_post',
      targetPost: post._id,
      reason: 'User deleted own post',
    });

    res.json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Archive/unarchive a post
router.post('/:id/archive', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to archive this post' });
    }

    post.isArchived = !post.isArchived;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: req.user.savedPosts.includes(post._id),
      likes: post.likes.length,
      comments: post.comments.length,
      isArchived: post.isArchived,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving post', error: error.message });
  }
});

// Restrict/unrestrict comments
router.post('/:id/restrict-comments', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to restrict comments on this post' });
    }

    post.restrictComments = !post.restrictComments;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name');
    res.json({
      ...updatedPost.toJSON(),
      isLikedPost: post.likes.includes(req.user._id),
      isSaved: post.savedBy.includes(req.user._id),
      likes: post.likes.length,
      comments: post.comments.length,
      restrictComments: post.restrictComments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error restricting comments', error: error.message });
  }
});

// Image upload endpoint for Tiptap editor
router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `${process.env.UPLOADS_URL || 'http://localhost:3000'}/posts/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error.stack);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Share the blog
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (!post.shares.includes(req.user._id)) {
      post.shares.push(req.user._id);
      await post.save();
    }
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('categories', 'name');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: post.savedBy.includes(req.user._id),
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing post', error: error.message });
  }
});

module.exports = router;