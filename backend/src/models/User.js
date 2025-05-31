const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, },
  username: { type: String, required: true, unique: true, trim: true, },
  email: { type: String, required: true, unique: true, trim: true, },
  password: { type: String, required: true, },
  avatar: { type: String, default: 'https://via.placeholder.com/40', },
  bio: { type: String, default: '', trim: true, },
  isAdmin: { type: Boolean, default: false, },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', }],
  commentedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', }],
  suspendedUntil: { type: Date, default: null, },
  isSuspended: { type: Boolean, default: false, },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);