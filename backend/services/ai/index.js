// Provider factory: reads AI_PROVIDER from env and returns the matching
// implementation of AIServiceInterface. Add a new provider (e.g. OpenAI)
// by creating OpenAIService.js (implementing the same interface) and
// adding one case below — no controller code needs to change.
const MockAIService = require('./MockAIService');

function getAIService() {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

  switch (provider) {
    case 'mock':
      return new MockAIService();
    // case 'openai':
    //   const OpenAIService = require('./OpenAIService');
    //   return new OpenAIService(process.env.AI_API_KEY);
    default:
      console.warn(`[ai] Unknown AI_PROVIDER "${provider}", falling back to mock`);
      return new MockAIService();
  }
}

module.exports = { getAIService };
