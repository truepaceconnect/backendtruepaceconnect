import { BeyondVideo } from "../../../Models/BeyondVideoModel/BeyondVideoModel.js";
import { Channel } from "../../../Models/HeadlineModel/HeadlineModel.js";
import { uploadFileToS3 } from "../../../AWS_S3/UploadToS3.js";

export const uploadVideo = async (req, res) => {
    try {
      if (!req.files || !req.files.video || !req.files.thumbnail) {
        return res.status(400).json({ message: 'Video and thumbnail are required' });
      }
  
      const { title, description, tags } = req.body;
      
      // Find the channel associated with the creator
      const channel = await Channel.findOne({ creatorId: req.user.uid });
      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }
  
      // Upload video to S3
      const videoUrl = await uploadFileToS3(req.files.video[0], 'videos');
      
      // Upload thumbnail to S3
      const thumbnailUrl = await uploadFileToS3(req.files.thumbnail[0], 'thumbnails');
  
      // Create new video document
      const video = new BeyondVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        channelId: channel._id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        duration: 0, // You might want to add video duration processing here
      });
  
      await video.save();
  
      // Update channel's content count
      channel.contentCount += 1;
      await channel.save();
  
      res.status(201).json({
        message: 'Video uploaded successfully',
        video: {
          id: video._id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl: video.videoUrl
        }
      });
  
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({
        message: 'Failed to upload video',
        error: error.message
      });
    }
  };