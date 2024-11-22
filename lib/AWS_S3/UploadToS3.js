import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./S3Config.js";
import crypto from 'crypto'
import path from 'path';

export const uploadFileToS3 = async (file) => {
  try {
    const fileExtension = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const key = `uploads/${randomName}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};