import { Announcement } from "../../Models/AnnouncementModel.js/AnnouncementModel.js";
import { Creator } from "../../Models/HeadlineModel/HeadlineModel.js";

export const createAnnouncement = async (req, res) => {
    try {
      const { title, content, important } = req.body;
      
      const announcement = new Announcement({
        title,
        content,
        createdBy: "Test User", // Hardcode a test user name for now
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
          select: 'displayName photoURL'
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
      creatorId: creator._id
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
    const creator = await Creator.findOne({ uid: req.user.uid });

    const announcement = await Announcement.findById(announcementId);
    const comment = announcement.comments.id(commentId);
    
    if (!comment.likes.includes(creator._id)) {
      comment.likes.push(creator._id);
      await announcement.save();
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to like comment', error: error.message });
  }
};

export const unlikeComment = async (req, res) => {
  try {
    const { announcementId, commentId } = req.params;
    const creator = await Creator.findOne({ uid: req.user.uid });

    const announcement = await Announcement.findById(announcementId);
    const comment = announcement.comments.id(commentId);
    
    comment.likes = comment.likes.filter(like => !like.equals(creator._id));
    await announcement.save();

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlike comment', error: error.message });
  }
};
