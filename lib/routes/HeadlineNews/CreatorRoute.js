import express from 'express';
import { registerCreator } from '../../Controllers/HeadlineController/CreatorController.js';
import { verifyFirebaseToken } from '../../Middlewares/AuthMiddleware.js';
import { verifyCreator } from '../../Controllers/HeadlineController/CreatorController.js';


const router = express.Router();

router.post('/register', verifyFirebaseToken, registerCreator);
router.get('/verify', verifyFirebaseToken, verifyCreator);

export default router;