import express from 'express';
import multer from 'multer';
 import { verifyFirebaseToken } from '../../Middlewares/AuthMiddleware.js';
 import { createArticle } from '../../Controllers/Beyond_Controller/beyond_article/BeyondArticleController.js';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/', 
  verifyFirebaseToken, 
  upload.single('previewImage'),
  createArticle
);

export default router;