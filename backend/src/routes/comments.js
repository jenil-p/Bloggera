const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Create a comment
router.post('/:postId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.restrictComments && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Comments are restricted on this post' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = new Comment({
      post: post._id,
      author: req.user._id,
      content,
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name username avatar');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// Get comments
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ post: post._id, isDeleted: false })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { author } = req.query;
    if (author !== 'me') {
      return res.status(400).json({ message: 'Invalid query' });
    }

    const comments = await Comment.find({ 
      author: req.user._id, 
      isDeleted: false 
    })
      .populate('author', 'name username avatar')
      .populate('post', 'content')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});


// Delete a comment
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete comment' });
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

module.exports = router;