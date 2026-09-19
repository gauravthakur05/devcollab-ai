const InAppNotificationService = require('./InAppNotificationService');

let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

function getNotificationService() {
  return new InAppNotificationService(ioInstance);
}

module.exports = { getNotificationService, setSocketIO };
