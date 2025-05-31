const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },
  reason: { type: String, enum: ['spam', 'inappropriate', 'harassment', 'other'], required: true, },
  message: { type: String, trim: true, },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending', },
  adminNotes: { type: String, default: '', trim: true, },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);