import express from 'express';
import multer from 'multer';
// import { registerCreator } from '../../Controllers/HeadlineController/CreatorController.js';
import { verifyFirebaseToken } from '../../Middlewares/AuthMiddleware.js';
import { verifyCreator,updateChannelPicture,registerCreator } from '../../Controllers/HeadlineController/CreatorController.js';


const router = express.Router();
const upload = multer({ 
    limits: { 
      fileSize: 5 * 1024 * 1024 // 5MB limit
    } 
  });

router.post('/register', verifyFirebaseToken, registerCreator);
router.get('/verify', verifyFirebaseToken, verifyCreator);

router.post('/upload-channel-picture', 
    verifyFirebaseToken, 
    upload.single('channelPicture'), 
    updateChannelPicture
  );
  

export default router;