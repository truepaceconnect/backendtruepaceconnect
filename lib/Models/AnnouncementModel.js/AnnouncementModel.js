import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  likes: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }, // Admin/founder's name
  comments: [CommentSchema],
  important: { type: Boolean, default: false }
});

export const Announcement = mongoose.model('Announcement', AnnouncementSchema);