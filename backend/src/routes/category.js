const express = require('express');
const Category = require('../models/Category');
const AdminAction = require('../models/AdminAction');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all approved categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ isApproved: true }).select('name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.stack);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Suggest a new category
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists or has been suggested' });
    }

    const category = new Category({
      name,
      isApproved: false,
      suggestedBy: req.user._id,
    });

    await category.save();
    res.status(201).json({ message: 'Category suggestion submitted successfully' });
  } catch (error) {
    console.error('Error suggesting category:', error.stack);
    res.status(500).json({ message: 'Error suggesting category', error: error.message });
  }
});

// Get all suggested (unapproved) categories (admin only)
router.get('/suggested', adminMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ isApproved: false })
      .populate('suggestedBy', 'name username')
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching suggested categories:', error.stack);
    res.status(500).json({ message: 'Error fetching suggested categories', error: error.message });
  }
});

// Approve a suggested category (admin only)
router.post('/approve/:id', adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.isApproved) {
      return res.status(400).json({ message: 'Category already approved' });
    }
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    category.isApproved = true;
    await category.save();

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'approve_category',
      targetUser: category.suggestedBy,
      reason,
      details: `Approved category: ${category.name}`,
    });

    res.json({ message: 'Category approved successfully' });
  } catch (error) {
    console.error('Error approving category:', error.stack);
    res.status(500).json({ message: 'Error approving category', error: error.message });
  }
});

// Reject a suggested category (admin only)
router.post('/reject/:id', adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.isApproved) {
      return res.status(400).json({ message: 'Category already approved' });
    }
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    await category.remove();

    await AdminAction.create({
      admin: req.user._id,
      actionType: 'reject_category',
      targetUser: category.suggestedBy,
      reason,
      details: `Rejected category: ${category.name}`,
    });

    res.json({ message: 'Category suggestion rejected successfully' });
  } catch (error) {
    console.error('Error rejecting category:', error.stack);
    res.status(500).json({ message: 'Error rejecting category', error: error.message });
  }
});

module.exports = router;