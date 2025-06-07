const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Report = require('../models/Report');
const AdminAction = require('../models/AdminAction');
const Comment = require('../models/Comment');
const { adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('name username avatar email isSuspended isAdmin suspendedUntil');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Delete a post
router.delete('/posts/:id', adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted || post.isArchived) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    post.isDeleted = true;
    await post.save();

    // Mark associated comments as deleted
    await Comment.updateMany({ post: post._id, isDeleted: false }, { isDeleted: true });

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'delete_post',
      targetPost: post._id,
      reason,
    });

    res.json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Block a user
router.post('/block/:userId', adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot block an admin' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: user._id },
    });

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'block_user',
      targetUser: user._id,
      reason,
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
});

// Suspend a user
router.post('/suspend/:userId', adminMiddleware, async (req, res) => {
  try {
    const { reason, durationDays } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot suspend an admin' });
    }

    if (!reason || !durationDays) {
      return res.status(400).json({ message: 'Reason and duration are required' });
    }

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(durationDays));

    user.isSuspended = true;
    user.suspendedUntil = suspendedUntil;
    await user.save();

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'suspend_user',
      targetUser: user._id,
      reason,
      details: `Suspended until ${suspendedUntil.toISOString()}`,
    });

    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending user', error: error.message });
  }
});

// Get all reports
router.get('/reports', adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .populate('post', 'content image')
      .populate('reportedBy', 'name username')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

// Resolve a report
router.post('/reports/:reportId/resolve', adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const report = await Report.findById(req.params.reportId).populate('post');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!report.post) {
      return res.status(404).json({ message: 'Associated post not found' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    // Mark the report as resolved
    report.status = 'resolved';
    await report.save();

    // Delete the associated post (similar to the delete post endpoint)
    const post = report.post;
    if (!post.isDeleted && !post.isArchived) {
      post.isDeleted = true;
      await post.save();

      // Mark associated comments as deleted
      await Comment.updateMany({ post: post._id, isDeleted: false }, { isDeleted: true });

      await AdminAction.create({
        admin: req.user._id,
        actionType: 'delete_post',
        targetPost: post._id,
        reason: `Post deleted due to resolved report: ${reason}`,
      });
    }

    // Log the resolve action
    await AdminAction.create({
      admin: req.user._id,
      actionType: 'resolve_report',
      targetReport: report._id,
      reason,
    });

    res.json({ message: 'Report resolved and post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving report', error: error.message });
  }
});

// Dismiss a report
router.post('/reports/:reportId/dismiss', adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    report.status = 'dismissed';
    await report.save();

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'dismiss_report',
      targetReport: report._id,
      reason,
    });

    res.json({ message: 'Report dismissed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error dismissing report', error: error.message });
  }
});

module.exports = router;