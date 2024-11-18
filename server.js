import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from './FirebaseAdmin.js';
import CreatorRoute from './lib/routes/HeadlineNews/CreatorRoute.js';
import ContentRoute from './lib/routes/HeadlineNews/ContentRoute.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Firebase before middleware
await initializeApp();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',//CREATOR_FRONTEND_URL
  credentials: true
}));

// Routes
app.use('/api/creators', CreatorRoute);
app.use('/api/content', ContentRoute);

// MongoDB connection
mongoose.connect(process.env.MONGO, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});