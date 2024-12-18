import { Announcement } from "../../Models/AnnouncementModel.js/AnnouncementModel.js";
import { Creator } from "../../Models/HeadlineModel/HeadlineModel.js";

// List of founder UIDs who can create announcements
const FOUNDER_UIDS = ['u7NvqBzv7mc905ixY1Ka2RgQRTS2', 'TZ9xW6r0EFgd7CQDrOwfe2DZRFB2'];

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, important } = req.body;
    
    // Check if the creator is a founder
    if (!FOUNDER_UIDS.includes(req.user.uid)) {
      return res.status(403).json({ message: 'Only founders can create announcements' });
    }
    
    const creator = await Creator.findOne({ uid: req.user.uid });
    
    const announcement = new Announcement({
      title,
      content,
      createdBy: creator.displayName,
      important: important || false
    });
    
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'comments.creatorId',
        populate: {
          path: 'channelId',
          select: 'picture'
        },
        select: 'displayName channelId'
      });
    
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { content } = req.body;
    const creator = await Creator.findOne({ uid: req.user.uid });

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.comments.push({
      content,
      creatorId: creator._id,
      likes: []
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { announcementId, commentId } = req.params;
    const uid = req.user.uid; // Use UID directly

    const announcement = await Announcement.findOne({
      "_id": announcementId,
      "comments._id": commentId
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement or comment not found' });
    }

    const comment = announcement.comments.id(commentId);
    
    // Check if user has already liked the comment using UID
    if (comment.likes.includes(uid)) {
      return res.status(400).json({ message: 'Comment already liked' });
    }

    // Add the UID to likes
    comment.likes.push(uid);
    await announcement.save();

    res.status(200).json(announcement);
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Failed to like comment', error: error.message });
  }
};

export const unlikeComment = async (req, res) => {
  try {
    const { announcementId, commentId } = req.params;
    const uid = req.user.uid; // Use UID directly

    const announcement = await Announcement.findOne({
      "_id": announcementId,
      "comments._id": commentId
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement or comment not found' });
    }

    const comment = announcement.comments.id(commentId);
    
    // Remove the UID from likes
    comment.likes = comment.likes.filter(likeId => likeId !== uid);
    await announcement.save();

    res.status(200).json(announcement);
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ message: 'Failed to unlike comment', error: error.message });
  }
};

export const markAnnouncementAsViewed = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const uid = req.user.uid;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user has already viewed
    const alreadyViewed = announcement.views.some(view => view.userId === uid);
    if (!alreadyViewed) {
      announcement.views.push({ userId: uid });
      await announcement.save();
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark announcement as viewed', error: error.message });
  }
};

