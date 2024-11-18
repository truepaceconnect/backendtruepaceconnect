import mongoose from 'mongoose';

const CreatorSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verificationDocuments: [String]
});

const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 50 },
    picture: { type: String },
    subscriberCount: { type: Number, default: 0 },
    description: { type: String },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    totalViews: { type: Number, default: 0 },
    avgEngagementRate: { type: Number, default: 0 },
    contentCount: { type: Number, default: 0 },
    creatorId: { type: String, required: true },
    topPerformingContent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BeyondArticle' }],
  });
  const ContentSchema = new mongoose.Schema({
    message: { type: String, required: true },
    picture: { type: String, required: false },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    creatorId: { type: String, required: true },
    isJustIn: { type: Boolean, default: true },
    justInExpiresAt: { type: Date },
    headlineExpiresAt: { type: Date },
  });
  
  const Creator = mongoose.model('Creator', CreatorSchema);
const Channel = mongoose.model('Channel', ChannelSchema);
const Content = mongoose.model('Content', ContentSchema);

 export {Creator,Channel,Content}