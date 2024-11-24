import mongoose from "mongoose";


// Enhanced Video Schema
const BeyondVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  createdAt: { type: Date, default: Date.now },
  duration: { type: Number, default:0 }, // in seconds
  tags: [String],
  shareCount: { type: Number, default: 0 },
  likes: [{ type: String }],
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  views: [{ type: String }], 
  viewCount: { type: Number, default: 0 },
  uniqueViewers: [{ type: String }], // Store UIDs of unique viewers
  avgWatchTime: { type: Number, default: 0 }, // Average watch time in seconds
  engagementScore: { type: Number, default: 0 },
  viralScore: { type: Number, default: 0 },
  isRecommended: { type: Boolean, default: false },
});

// Methods for BeyondVideo Schema
BeyondVideoSchema.methods.calculateEngagementScore = function() {
  const totalInteractions = this.likeCount + this.commentCount;
  const uniqueViewerCount = this.uniqueViewers.length;
  console.log('Calculating engagement score:', {
    totalInteractions,
    uniqueViewerCount
  });
  return uniqueViewerCount > 0 ? (totalInteractions / uniqueViewerCount) * 100 : 0;
};

BeyondVideoSchema.methods.calculateViralScore = function() {
  const timeFactor = Math.max(1, (Date.now() - this.createdAt) / (1000 * 60 * 60)); // Hours since creation
  const engagementRate = this.engagementScore / timeFactor;
  const viewGrowthRate = this.viewCount / timeFactor;
  console.log('Calculating viral score:', {
    timeFactor,
    engagementRate,
    viewGrowthRate
  });
  return (engagementRate * 0.7) + (viewGrowthRate * 0.3); // Weighted average
};

export const BeyondVideo = mongoose.model('BeyondVideo', BeyondVideoSchema);