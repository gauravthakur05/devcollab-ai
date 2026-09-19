const LocalStorageService = require('./LocalStorageService');

function getStorageService() {
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  switch (provider) {
    case 'local':
    default:
      return new LocalStorageService();
    // case 's3': return new S3StorageService(...)
  }
}

module.exports = { getStorageService };
