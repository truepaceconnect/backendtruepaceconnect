import { Content,Creator ,Channel} from "../../Models/HeadlineModel/HeadlineModel.js";
import { uploadFileToS3 } from "../../AWS_S3/UploadToS3.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('file');

export const createContent = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { message, isJustIn, tags } = req.body;
      let pictureUrl = null;

      // Upload file to S3 if present
      if (req.file) {
        pictureUrl = await uploadFileToS3(req.file);
      }

      const creator = await Creator.findOne({ uid: req.user.uid });
      if (!creator) {
        return res.status(404).json({ message: 'Creator not found' });
      }

      const now = new Date();
      const content = new Content({
        message,
        picture: pictureUrl,
        channelId: creator.channelId,
        creatorId: creator.uid,
        isJustIn,
        tags,
        justInExpiresAt: isJustIn ? new Date(Date.now() + 15 * 60 * 1000) : null,
        headlineExpiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
        uploadedAt: now
      });

      await content.save();

      // Update channel metrics
      const channel = await Channel.findById(creator.channelId);
      if (channel) {
        channel.totalViews += 1;
        const allContent = await Content.find({ channelId: channel._id });
        const totalEngagement = allContent.reduce((sum, content) => sum + content.engagementScore, 0);
        channel.avgEngagementRate = totalEngagement / allContent.length;
        await channel.save();
      }

      res.status(201).json(content);
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message });
  }
};