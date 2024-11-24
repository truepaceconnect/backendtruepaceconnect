import express from 'express';
import multer from 'multer';
import { verifyFirebaseToken } from '../../Middlewares/AuthMiddleware.js';
import { uploadVideo } from '../../Controllers/Beyond_Controller/beyond_video/BeyondVideoController.js';

const router = express.Router();


// Configure multer for video uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
      files: 2 // Allow video and thumbnail
    }
  });
  
  // Routes
  router.post('/upload',
    verifyFirebaseToken,
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    uploadVideo
  );

  
export default router;