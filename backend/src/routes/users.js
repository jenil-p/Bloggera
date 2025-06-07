const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const mongoose = require('mongoose');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: './uploads/avatars/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  },
});

// Update profile
router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    if (!name || !username) {
      return res.status(400).json({ message: 'Name and username are required' });
    }

    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: req.user._id } 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const updateData = {
      name,
      username,
      bio: bio || '',
    };

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      select: 'name username avatar bio isAdmin isSuspended blockedUsers likedPosts commentedPosts savedPosts suspendedUntil',
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error.stack);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user profile by username
router.get('/:username', authMiddleware, async (req, res) => {
  try {
    // Validate ObjectId for req.user._id
    if (!mongoose.isValidObjectId(req.user._id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findOne({ username: req.params.username })
      .select('name username avatar bio');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'User is suspended' });
    }

    // Fetch current user to check blocked users
    const currentUser = await User.findById(req.user._id).select('blockedUsers savedPosts');
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (currentUser.blockedUsers.some(id => id.toString() === user._id.toString())) {
      return res.status(403).json({ message: 'You have blocked this user' });
    }

    const posts = await Post.find({ 
      author: user._id, 
      isDeleted: false, 
      isArchived: false 
    })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({
      user,
      posts: posts.map(post => ({
        ...post.toJSON(),
        isLiked: post.likes.some(id => id.toString() === req.user._id.toString()),
        isSaved: currentUser.savedPosts.some(id => id.toString() === post._id.toString()),
        likes: post.likes.length,
        comments: post.comments.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching profile:', error.stack);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Block user
router.post('/block/:userId', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUser._id },
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error.stack);
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
});

module.exports = router;