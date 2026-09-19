/**
 * Interface every AI provider implementation must satisfy. This lets
 * controllers depend on the interface, not a concrete provider, so
 * swapping MockAIService for OpenAIService (or any other provider) later
 * is a one-line change in ai/index.js — nothing else in the app changes.
 */
class AIServiceInterface {
  // eslint-disable-next-line no-unused-vars
  async reviewCode({ code, language }) {
    throw new Error('reviewCode() must be implemented by the AI provider');
  }

  // eslint-disable-next-line no-unused-vars
  async detectBug({ code, errorMessage, stackTrace, language }) {
    throw new Error('detectBug() must be implemented by the AI provider');
  }

  // eslint-disable-next-line no-unused-vars
  async generateCommitMessage({ changedFiles, diff, description }) {
    throw new Error('generateCommitMessage() must be implemented by the AI provider');
  }
}

module.exports = AIServiceInterface;
