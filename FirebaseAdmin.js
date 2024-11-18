import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let app;

function initializeApp() {
  if (!app) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  return app;
}

export { initializeApp };
export default admin;