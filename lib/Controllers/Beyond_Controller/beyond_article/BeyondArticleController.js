
import { BeyondArticle } from '../../../Models/BeyondArticleModel/BeyondArticleModel.js';
import { Channel } from '../../../Models/HeadlineModel/HeadlineModel.js';
import { uploadFileToS3 } from '../../../AWS_S3/UploadToS3.js';

export const createArticle = async (req, res) => {
  try {
    const { title, previewContent, fullContent, tags, readTime } = req.body;

    // Find the channel associated with the creator
    const channel = await Channel.findOne({ creatorId: req.user.uid });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    let previewImageUrl = null;
    if (req.file) {
      previewImageUrl = await uploadFileToS3(req.file);
    }

    const article = new BeyondArticle({
      title,
      previewContent,
      fullContent,
      previewImage: previewImageUrl,
      channelId: channel._id,
      tags: tags || [],
      readTime: parseInt(readTime) || 5
    });

    await article.save();

    // Update channel's content count
    channel.contentCount += 1;
    await channel.save();

    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      message: 'Failed to create article',
      error: error.message 
    });
  }
};
