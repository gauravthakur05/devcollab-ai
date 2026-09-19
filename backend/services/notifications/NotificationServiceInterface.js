class NotificationServiceInterface {
  // eslint-disable-next-line no-unused-vars
  async notify({ userId, type, title, message, link, relatedProjectId }) {
    throw new Error('notify() must be implemented');
  }
}
module.exports = NotificationServiceInterface;
