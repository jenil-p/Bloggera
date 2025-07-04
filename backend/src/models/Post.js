const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  image: { type: String, default: null },
  tags: [{ type: String, trim: true }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  suggestedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  restrictComments: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);