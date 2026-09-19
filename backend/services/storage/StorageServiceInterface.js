class StorageServiceInterface {
  // eslint-disable-next-line no-unused-vars
  async upload(fileBuffer, fileName, mimeType) {
    throw new Error('upload() must be implemented');
  }
  // eslint-disable-next-line no-unused-vars
  async getUrl(fileKey) {
    throw new Error('getUrl() must be implemented');
  }
}
module.exports = StorageServiceInterface;
