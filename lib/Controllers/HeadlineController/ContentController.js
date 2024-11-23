import { Content, Creator, Channel } from "../../Models/HeadlineModel/HeadlineModel.js";
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
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message });
      }

      // Debug logs
      // console.log('Received body:', req.body);
      // console.log('Received tags:', req.body.tags);

      const { message, isJustIn } = req.body;
      
      // Handle tags in different possible formats
      let tags = [];
      if (req.body.tags) {
        if (Array.isArray(req.body.tags)) {
          tags = req.body.tags;
        } else if (typeof req.body.tags === 'string') {
          tags = [req.body.tags];
        }
      }

      console.log('Processed tags:', tags);

      let pictureUrl = null;

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
        isJustIn: isJustIn === 'true',
        tags: tags,
        justInExpiresAt: isJustIn === 'true' ? new Date(Date.now() + 15 * 60 * 1000) : null,
        headlineExpiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
        uploadedAt: now
      });

      // console.log('Content before save:', content);

      await content.save();
      // console.log('Content after save:', content);

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