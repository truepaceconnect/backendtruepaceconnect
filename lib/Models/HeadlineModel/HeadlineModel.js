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
    headlineExpiresAt: { type: Date } , // Engagement Metrics
    createdAt: { type: Date, default: Date.now },
  uploadedAt: { type: Date, default: Date.now },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    screenshotCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    viralScore: { type: Number, default: 0 },
    avgReadTime: { type: Number, default: 0 },
    
    // Categories and Visibility
    tags: [String],
    showInAllChannels: { type: Boolean, default: true },
    
    // User Tracking
    uniqueViewers: [{ type: String }],
    viewedBy: [{ type: String }]
  });
  
  // Add TTL index for automatic document expiration
  ContentSchema.index({ headlineExpiresAt: 1 }, { expireAfterSeconds: 0 });
  
  // Methods for calculating scores
  ContentSchema.methods.calculateEngagementScore = function() {
    return (
      this.likeCount * 2 +
      this.commentCount * 3 +
      this.shareCount * 4 +
      this.viewCount +
      this.screenshotCount * 2
    );
  };
  
  ContentSchema.methods.calculateViralScore = function() {
    const timeElapsed = (Date.now() - this.createdAt) / (1000 * 60 * 60); // hours
    const engagementRate = this.calculateEngagementScore() / timeElapsed;
    return Math.round(engagementRate * 100) / 100;
  };
  
  const Creator = mongoose.model('Creator', CreatorSchema);
const Channel = mongoose.model('Channel', ChannelSchema);
const Content = mongoose.model('Content', ContentSchema);

 export {Creator,Channel,Content}