const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: {
    type: String,
    enum: ['delete_post','block_user','suspend_user','unsuspend_user','resolve_report','dismiss_report','approve_category','reject_category',
    ],
    required: true,
  },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  targetPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  targetReport: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  reason: { type: String, required: true, trim: true },
  details: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminAction', adminActionSchema);