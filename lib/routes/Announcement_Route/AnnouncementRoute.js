import express from "express";
import { verifyFirebaseToken } from "../../Middlewares/AuthMiddleware.js";
import { createAnnouncement,getAnnouncements,addComment,likeComment,unlikeComment } from "../../Controllers/announcement_Controller/AnnouncementController.js";

const router = express.Router();

router.post('/create', verifyFirebaseToken, createAnnouncement);

// Creator routes
router.get('/', verifyFirebaseToken, getAnnouncements);
router.post('/:announcementId/comment', verifyFirebaseToken, addComment);
router.post('/:announcementId/comment/:commentId/like', verifyFirebaseToken, likeComment);
router.delete('/:announcementId/comment/:commentId/like', verifyFirebaseToken, unlikeComment);

export default router;