const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Category = require('../models/Category');
const AdminAction = require('../models/AdminAction');
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

// Delete user (Admin only)
router.delete('/delete/:userId', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    // Start a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete user's posts and associated comments
      const posts = await Post.find({ author: targetUser._id }).session(session);
      const postIds = posts.map(post => post._id);
      await Comment.deleteMany({ post: { $in: postIds } }).session(session);
      await Post.deleteMany({ author: targetUser._id }).session(session);

      // Remove user's comments
      await Comment.deleteMany({ author: targetUser._id }).session(session);

      // Remove user's reports
      await Report.deleteMany({ reportedBy: targetUser._id }).session(session);

      // Remove user's category suggestions
      await Category.deleteMany({ suggestedBy: targetUser._id }).session(session);

      // Remove user from other users' arrays (likes, savedPosts, blockedUsers)
      await User.updateMany(
        { $or: [{ likedPosts: { $in: postIds } }, { savedPosts: { $in: postIds } }, { blockedUsers: targetUser._id }] },
        {
          $pull: {
            likedPosts: { $in: postIds },
            savedPosts: { $in: postIds },
            blockedUsers: targetUser._id,
          },
        }
      ).session(session);

      // Remove user from posts' likes and savedBy arrays
      await Post.updateMany(
        { $or: [{ likes: targetUser._id }, { savedBy: targetUser._id }] },
        {
          $pull: {
            likes: targetUser._id,
            savedBy: targetUser._id,
          },
        }
      ).session(session);

      // Delete the user
      await User.deleteOne({ _id: targetUser._id }).session(session);

      // Log the admin action
      await AdminAction.create([{
        admin: req.user._id,
        actionType: 'delete_user',
        targetUser: targetUser._id,
        reason: req.body.reason || 'User deletion by admin',
        details: req.body.details || '',
      }], { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error.stack);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { userIds, reason, deleteAll } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }
    let targetUsers;
    if (deleteAll) {
      targetUsers = await User.find({ _id: { $ne: req.user._id }, isAdmin: false });
    } else {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'User IDs array is required unless deleteAll is true' });
      }
      if (userIds.some(id => !mongoose.isValidObjectId(id))) {
        return res.status(400).json({ message: 'Invalid user ID(s)' });
      }
      if (userIds.includes(req.user._id.toString())) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
      }
      targetUsers = await User.find({ _id: { $in: userIds }, isAdmin: false });
      if (targetUsers.length !== userIds.length) {
        return res.status(404).json({ message: 'One or more users not found or are admins' });
      }
    }
    const adminActions = [];
    for (const targetUser of targetUsers) {
      const posts = await Post.find({ author: targetUser._id });
      const postIds = posts.map(post => post._id);
      await Comment.deleteMany({ post: { $in: postIds } });
      await Post.deleteMany({ author: targetUser._id });
      await Comment.deleteMany({ author: targetUser._id });
      await Report.deleteMany({ reportedBy: targetUser._id });
      await Category.deleteMany({ suggestedBy: targetUser._id });
      await User.updateMany(
        { $or: [{ likedPosts: { $in: postIds } }, { savedPosts: { $in: postIds } }, { blockedUsers: targetUser._id }] },
        { $pull: { likedPosts: { $in: postIds }, savedPosts: { $in: postIds }, blockedUsers: targetUser._id } }
      );
      await Post.updateMany(
        { $or: [{ likes: targetUser._id }, { savedBy: targetUser._id }] },
        { $pull: { likes: targetUser._id, savedBy: targetUser._id } }
      );
      await User.deleteOne({ _id: targetUser._id });
      adminActions.push({
        admin: req.user._id,
        actionType: 'delete_user',
        targetUser: targetUser._id,
        reason: reason || 'Bulk user deletion by admin',
        details: req.body.details || '',
        createdAt: new Date(),
      });
    }
    await AdminAction.insertMany(adminActions);
    res.json({ message: `${targetUsers.length} user(s) and related data deleted successfully` });
  } catch (error) {
    console.error('Error deleting users:', error.stack);
    res.status(500).json({ message: 'Error deleting users', error: error.message });
  }
});

module.exports = router;