const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const user = await User.findById(req.user._id).select('blockedUsers savedPosts');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const blockedUsers = user.blockedUsers || [];
    // Get users who have blocked the current user
    const blockedByUsers = await User.find({ blockedBy: req.user._id }).distinct('_id');

    // Validate category if provided
    if (category && !mongoose.isValidObjectId(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Search users
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      isSuspended: false,
      _id: { $nin: [...blockedUsers, ...blockedByUsers] }, // Exclude both blocked and blocking users
    }).select('name username avatar bio').limit(10);

    // Build post query
    const postQuery = {
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      isDeleted: false,
      isArchived: false,
      author: { $nin: [...blockedUsers, ...blockedByUsers] }, // Exclude both blocked and blocking users
    };
    if (category) {
      postQuery.categories = category;
    }

    // Search posts
    const posts = await Post.find(postQuery)
      .populate('author', 'name username avatar')
      .populate({
        path: 'categories',
        select: 'name',
        match: { _id: { $exists: true } },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Extract unique tags from posts
    const tagQuery = {
      tags: { $regex: q, $options: 'i' },
      isDeleted: false,
      isArchived: false,
      author: { $nin: [...blockedUsers, ...blockedByUsers] }, // Exclude both blocked and blocking users
    };
    if (category) {
      tagQuery.categories = category;
    }
    const tagPosts = await Post.find(tagQuery).select('tags');
    const tags = [...new Set(
      tagPosts
        .flatMap(post => post.tags || [])
        .filter(tag => tag.toLowerCase().includes(q.toLowerCase()))
    )].slice(0, 10);

    res.json({
      users: users.map(user => user.toJSON()),
      posts: posts.map(post => ({
        ...post.toJSON(),
        isLiked: post.likes.includes(req.user._id),
        isSaved: user.savedPosts.includes(post._id),
        likes: post.likes.length,
        comments: post.comments.length,
      })),
      tags,
    });
  } catch (error) {
    console.error('Search error:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
    res.status(500).json({ message: 'Error searching', error: error.message });
  }
});

module.exports = router;