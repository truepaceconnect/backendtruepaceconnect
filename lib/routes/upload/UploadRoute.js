import express from 'express'
import multer from 'multer'
import { backblazeService } from '../../Services/BackblazeService.js'
import { verifyFirebaseToken } from '../../Middlewares/AuthMiddleware.js'

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

router.post('/', verifyFirebaseToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const downloadUrl = await backblazeService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(200).json({ url: downloadUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;