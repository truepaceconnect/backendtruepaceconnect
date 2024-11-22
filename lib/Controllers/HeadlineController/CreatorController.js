import { Creator,Channel } from "../../Models/HeadlineModel/HeadlineModel.js";
import { uploadFileToS3 } from "../../AWS_S3/UploadToS3.js";

export const registerCreator = async (req, res) => {
  try {
    const { uid, email } = req.user; // From verified Firebase token
    const { channelName, description, tags } = req.body;

    // Check if creator already exists
    const existingCreator = await Creator.findOne({ uid });
    if (existingCreator) {
      return res.status(400).json({ message: 'Creator already registered' });
    }

    const creator = new Creator({
      uid,
      email,
      displayName: channelName, // Use channelName as displayName if not provided
      photoURL: req.user.picture || null
    });
    await creator.save();

    const channel = new Channel({
      name: channelName,
      description,
      tags: tags || [],
      creatorId: uid
    });
    await channel.save();

    creator.channelId = channel._id;
    await creator.save();

    res.status(201).json({ creator, channel });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Failed to register creator',
      error: error.message 
    });
  }
};
export const verifyCreator = async (req, res) => {
  try {
    const creator = await Creator.findOne({ uid: req.user.uid });
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // You might want to include the channel information
    const channel = await Channel.findById(creator.channelId);
    
    res.status(200).json({ creator, channel });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Failed to verify creator' });
  }
};

export const updateChannelPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to S3
    const pictureUrl = await uploadFileToS3(req.file);

    // Find the channel associated with the creator
    const channel = await Channel.findOne({ creatorId: req.user.uid });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Update channel picture
    channel.picture = pictureUrl;
    await channel.save();

    res.status(200).json({ 
      message: 'Channel picture updated successfully', 
      pictureUrl 
    });
  } catch (error) {
    console.error('Error updating channel picture:', error);
    res.status(500).json({ message: 'Failed to update channel picture' });
  }
};