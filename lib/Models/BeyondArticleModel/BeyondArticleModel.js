import mongoose from 'mongoose';

// BeyondArticle Schema (Enhanced)
const BeyondArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  previewContent: { type: String, required: true },
  previewImage: { type: String, required: true },
  fullContent: { type: String, required: true },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  createdAt: { type: Date, default: Date.now },
  commentsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  views: [{ type: String }], // Array of user IDs who viewed the article
  likes: [{ type: String }], // Array of user IDs who liked the article
  viewsCount: { type: Number, default: 0 },
  readTime: { type: Number, required: true },
  tags: [String], // Categories or themes of the article
  engagementScore: { type: Number, default: 0 },
  viralScore: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  avgReadTime: { type: Number, default: 0 },
  uniqueViewersCount: { type: Number, default: 0 },
});
// Methods
BeyondArticleSchema.methods.calculateEngagementScore = function() {
    const totalInteractions = this.likesCount + this.commentsCount + this.shareCount;
    return this.uniqueViewersCount > 0 ? (totalInteractions / this.uniqueViewersCount) * 100 : 0;
  };
  
  BeyondArticleSchema.methods.calculateViralScore = function() {
    const timeFactor = Math.max(1, (Date.now() - this.createdAt) / (1000 * 60 * 60)); // Hours since creation
    const engagementRate = this.engagementScore / timeFactor;
    const viewGrowthRate = this.viewsCount / timeFactor;
    return (engagementRate * 0.7) + (viewGrowthRate * 0.3); // Weighted average
  };
  
  
  export const BeyondArticle = mongoose.model('BeyondArticle', BeyondArticleSchema);  