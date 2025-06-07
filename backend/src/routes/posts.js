const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const AdminAction = require('../models/AdminAction');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/posts/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Create a post
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = new Post({
      author: req.user._id,
      content,
      image: req.file ? `/uploads/posts/${req.file.filename}` : null,
      tags: tags ? JSON.parse(tags) : [],
    });

    await post.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { commentedPosts: post._id },
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { author, liked, saved } = req.query;
    let query = { isDeleted: false, isArchived: false };

    if (author === 'me') {
      query.author = req.user._id;
    } else if (author) {
      const user = await User.findOne({ username: author });
      if (!user) return res.status(404).json({ message: 'User not found' });
      query.author = user._id;
    }

    if (liked) {
      query._id = { $in: req.user.likedPosts };
    }

    if (saved) {
      query._id = { $in: req.user.savedPosts };
    }

    const posts = await Post.find(query)
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts.map(post => ({
      ...post.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: req.user.savedPosts.includes(post._id),
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get posts by search query
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
      ],
      isDeleted: false,
      isArchived: false,
    })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      isSuspended: false,
    })
      .select('name username avatar')
      .limit(20);

    res.json({
      posts: posts.map(post => ({
        ...post.toJSON(),
        isLiked: post.likes.includes(req.user._id),
        isSaved: req.user.savedPosts.includes(post._id),
        likes: post.likes.length,
        comments: post.comments.length,
        shares: post.shares.length,
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
    const updatedPost = await Post.findById(post._id).populate('author', 'name username avatar');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: !isLiked,
      isSaved: req.user.savedPosts.includes(post._id),
      likes: updatedPost.likes.length,
      comments: updatedPost.comments.length,
      shares: updatedPost.shares.length,
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
    const updatedPost = await Post.findById(post._id).populate('author', 'name username avatar');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(userId),
      isSaved: !isSaved,
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving post', error: error.message });
  }
});

// Share a post
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares.push(req.user._id);
    await post.save();
    const updatedPost = await Post.findById(post._id).populate('author', 'name username avatar');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: req.user.savedPosts.includes(post._id),
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing post', error: error.message });
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

    const updatedPost = await Post.findById(post._id).populate('author', 'name username avatar');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: req.user.savedPosts.includes(post._id),
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
      isArchived: post.isArchived,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving post', error: error.message });
  }
});

router.post('/:id/restrict-comments', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to restrict comments on this post' });
    }

    post.restrictComments = !post.restrictComments || false;
    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'name username avatar');
    res.json({
      ...updatedPost.toJSON(),
      isLiked: post.likes.includes(req.user._id),
      isSaved: req.user.savedPosts.includes(post._id),
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
      restrictComments: post.restrictComments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error restricting comments', error: error.message });
  }
});

module.exports = router;