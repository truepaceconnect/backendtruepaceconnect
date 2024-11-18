import { Content,Creator } from "../../Models/HeadlineModel/HeadlineModel.js";
export const createContent = async (req, res) => {
  try {
    const { message, picture, isJustIn, tags } = req.body;
    const creator = await Creator.findOne({ uid: req.user.uid });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const content = new Content({
      message,
      picture, // This is now the Firebase Storage URL
      channelId: creator.channelId,
      creatorId: creator.uid,
      isJustIn,
      tags,
      justInExpiresAt: isJustIn ? new Date(Date.now() + 15 * 60 * 1000) : null,
      headlineExpiresAt: new Date(new Date().setHours(23, 59, 59, 999))
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message });
  }
};