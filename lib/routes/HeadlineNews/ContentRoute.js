import express from 'express';
import { createContent } from '../../Controllers/HeadlineController/ContentController.js';
import { verifyFirebaseToken } from '../../Middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/', verifyFirebaseToken, createContent);

export default router;