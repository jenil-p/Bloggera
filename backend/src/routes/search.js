const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const user = await User.findById(req.user._id);
    const blockedUsers = user.blockedUsers || [];

    // Search users
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      isSuspended: false,
      _id: { $nin: blockedUsers },
    }).select('name username avatar bio');

    // Search posts
    const posts = await Post.find({
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      isDeleted: false,
      isArchived: false,
      author: { $nin: blockedUsers },
    })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({
      users,
      posts: posts.map(post => ({
        ...post.toJSON(),
        isLiked: post.likes.includes(req.user._id),
        isSaved: user.savedPosts.includes(post._id),
        likes: post.likes.length,
        comments: post.comments.length,
        shares: post.shares.length,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching', error: error.message });
  }
});

module.exports = router;