const StorageServiceInterface = require('./StorageServiceInterface');

// Placeholder local implementation. Swap for an S3StorageService later
// (same interface) once AWS credentials are configured — nothing else
// in the app needs to change.
class LocalStorageService extends StorageServiceInterface {
  async upload(fileBuffer, fileName) {
    console.log(`[storage:local] Would store file "${fileName}" (${fileBuffer?.length || 0} bytes) locally.`);
    return { key: fileName, url: `/uploads/${fileName}` };
  }

  async getUrl(fileKey) {
    return `/uploads/${fileKey}`;
  }
}

module.exports = LocalStorageService;
