import fetch from 'node-fetch'
import crypto from 'crypto';

class BackblazeService {
  constructor() {
    this.applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
    this.applicationKey = process.env.B2_APPLICATION_KEY;
    this.bucketId = process.env.B2_BUCKET_ID;
    this.authToken = null;
    this.apiUrl = null;
    this.downloadUrl = null;
  }

  async authorize() {
    if (this.authToken) return;

    const authString = Buffer.from(`${this.applicationKeyId}:${this.applicationKey}`).toString('base64');
    
    try {
      const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        headers: {
          Authorization: `Basic ${authString}`
        }
      });

      if (!response.ok) {
        throw new Error(`Authorization failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.authorizationToken;
      this.apiUrl = data.apiUrl;
      this.downloadUrl = data.downloadUrl;
    } catch (error) {
      console.error('B2 authorization error:', error);
      throw new Error('Failed to authorize with Backblaze B2');
    }
  }

  async getUploadUrl() {
    await this.authorize();

    try {
      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: {
          Authorization: this.authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bucketId: this.bucketId })
      });

      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw new Error('Failed to get upload URL');
    }
  }

  async uploadFile(buffer, originalFilename, contentType) {
    try {
      const { uploadUrl, authorizationToken } = await this.getUploadUrl();

      // Create a unique filename
      const timestamp = Date.now();
      const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `content-images/${timestamp}-${sanitizedFilename}`;

      // Calculate SHA1 hash
      const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(filename),
          'Content-Type': contentType,
          'Content-Length': buffer.length,
          'X-Bz-Content-Sha1': sha1,
          'X-Bz-Server-Side-Encryption': 'AES256'
        },
        body: buffer
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      return `${this.downloadUrl}/file/${this.bucketId}/${encodeURIComponent(filename)}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

export const backblazeService = new BackblazeService();