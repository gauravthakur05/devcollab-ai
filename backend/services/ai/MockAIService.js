const AIServiceInterface = require('./AIServiceInterface');

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function countLines(code = '') {
  return code.split('\n').length;
}

/**
 * Deterministic-ish local "AI" that produces realistic, structured analysis
 * without calling any external API. Heuristics are simple (line count,
 * keyword search) — the point is a believable, well-shaped response that
 * exercises the full UI and data model. Swap for OpenAIService later by
 * implementing the same AIServiceInterface methods.
 */
class MockAIService extends AIServiceInterface {
  async reviewCode({ code, language }) {
    await simulateLatency();

    const lines = countLines(code);
    const hasTryCatch = /try\s*{/.test(code) || /except/.test(code);
    const hasConsoleLog = /console\.log|print\(/.test(code);
    const hasVarKeyword = /\bvar\s+/.test(code);
    const hasMagicNumbers = /[^a-zA-Z0-9_](?:\d{2,})[^a-zA-Z0-9_.]/.test(code);
    const hasLongLine = code.split('\n').some((l) => l.length > 120);

    const bugs = [];
    const securityIssues = [];
    const performanceIssues = [];
    const codeSmells = [];

    if (!hasTryCatch && /await |\.then\(/.test(code)) {
      bugs.push('Asynchronous calls are not wrapped in error handling — an unhandled rejection could crash the process.');
    }
    if (/==[^=]/.test(code) && (language || '').toLowerCase().includes('javascript')) {
      bugs.push('Loose equality (==) detected; this can cause unexpected type coercion bugs.');
    }
    if (/password|secret|apikey|api_key/i.test(code) && /['"][a-zA-Z0-9]{8,}['"]/.test(code)) {
      securityIssues.push('Possible hard-coded credential or secret detected in source code.');
    }
    if (/SELECT .* FROM .*\+/i.test(code) || /query\(.*\+.*req\./i.test(code)) {
      securityIssues.push('String-concatenated query construction may be vulnerable to injection attacks.');
    }
    if (/eval\(/.test(code)) {
      securityIssues.push('Use of eval() can execute arbitrary code and is a significant security risk.');
    }
    if (/for\s*\(.*\)\s*{[\s\S]*for\s*\(.*\)\s*{/.test(code)) {
      performanceIssues.push('Nested loops detected — verify this is not operating on large collections (O(n²) risk).');
    }
    if (hasLongLine) {
      codeSmells.push('One or more lines exceed 120 characters, hurting readability.');
    }
    if (hasVarKeyword) {
      codeSmells.push("Use of 'var' detected; prefer 'const'/'let' for predictable block scoping.");
    }
    if (hasConsoleLog) {
      codeSmells.push('Debug logging statements left in code; consider removing or using a proper logger.');
    }
    if (hasMagicNumbers) {
      codeSmells.push('Magic numbers found; consider extracting them into named constants.');
    }
    if (lines > 80) {
      codeSmells.push('This function/file is quite long; consider splitting it into smaller units.');
    }

    if (bugs.length === 0) bugs.push('No obvious logic bugs detected in a static pass — consider adding unit tests to confirm.');
    if (securityIssues.length === 0) securityIssues.push('No obvious security red flags found in this snippet.');
    if (performanceIssues.length === 0) performanceIssues.push('No obvious performance bottlenecks found for the size of this snippet.');
    if (codeSmells.length === 0) codeSmells.push('Code style looks reasonably clean.');

    const issueCount = bugs.length + securityIssues.length + performanceIssues.length + codeSmells.length - 4; // subtract the "no issue" filler lines that may remain
    const penalty = Math.max(0, issueCount) * 6 + (hasLongLine ? 4 : 0) + (lines > 150 ? 8 : 0);
    const qualityScore = Math.max(35, Math.min(98, 92 - penalty + Math.floor(Math.random() * 6)));

    const complexity = lines > 150 ? 'HIGH' : lines > 60 ? 'MODERATE' : 'LOW';
    const maintainability = qualityScore > 80 ? 'HIGH' : qualityScore > 55 ? 'MODERATE' : 'LOW';

    const suggestions = [
      'Add unit tests covering edge cases and error paths.',
      'Extract repeated logic into small, well-named helper functions.',
      hasTryCatch ? 'Log caught errors with enough context to debug in production.' : 'Wrap I/O and async operations in try/catch blocks.',
      'Add JSDoc / type annotations for public functions to improve IDE support.',
      pick([
        'Consider validating inputs at the boundary before processing.',
        'Consider memoizing expensive computations if this runs on a hot path.',
        'Consider renaming ambiguous variables for clarity.',
      ]),
    ];

    const improvedCode = buildImprovedCodeStub(code, language);

    return {
      qualityScore,
      complexity,
      maintainability,
      findings: { bugs, securityIssues, performanceIssues, codeSmells },
      suggestions,
      improvedCode,
      provider: 'mock',
    };
  }

  async detectBug({ code, errorMessage, stackTrace, language }) {
    await simulateLatency();

    const text = `${errorMessage || ''} ${stackTrace || ''}`.toLowerCase();
    let severity = 'MEDIUM';
    let possibleCause = 'An unexpected value or state was encountered at runtime that the code did not account for.';
    let explanation = 'The reported error typically occurs when a value the code assumes to exist (or be of a certain type) turns out to be missing or different at runtime.';
    let suggestedFix = 'Add a guard clause to check the value before using it, and handle the missing/invalid case explicitly.';

    if (text.includes('undefined') || text.includes('null') || text.includes('nonetype')) {
      severity = 'HIGH';
      possibleCause = 'Code attempted to access a property or call a method on a value that was null/undefined at runtime.';
      explanation = 'This is one of the most common runtime errors: a variable expected to hold an object (e.g. a fetched record, a prop, a query result) was actually null or undefined at the point of use — often because an earlier async call failed silently or a conditional path was not handled.';
      suggestedFix = 'Add a null/undefined check (or optional chaining) before accessing the property, and trace back to where the value should have been set to confirm why it was missing.';
    } else if (text.includes('timeout') || text.includes('econnrefused') || text.includes('network')) {
      severity = 'HIGH';
      possibleCause = 'A network call to an external service or database did not complete in time or was refused.';
      explanation = 'The process attempted to reach a dependency (database, API, or service) that was unreachable, slow, or misconfigured (wrong host/port), causing the request to fail or hang.';
      suggestedFix = 'Verify the target service is running and reachable, confirm host/port/credentials in configuration, and add a retry with backoff plus a sane timeout.';
    } else if (text.includes('permission') || text.includes('unauthorized') || text.includes('403') || text.includes('401')) {
      severity = 'MEDIUM';
      possibleCause = 'The request was made without valid credentials, or the authenticated user lacks permission for this action.';
      explanation = 'This is an authorization/authentication failure rather than a logic bug — the request reached the server correctly but was rejected because the token was missing/expired/invalid or the role lacks the required permission.';
      suggestedFix = 'Confirm the request includes a valid, unexpired token, and check that the authenticated user\'s role is permitted to perform this action.';
    } else if (text.includes('syntax')) {
      severity = 'CRITICAL';
      possibleCause = 'A syntax error is preventing the file from being parsed at all.';
      explanation = 'This class of error stops execution before any of your logic runs — it is almost always a typo, mismatched bracket/quote, or an unsupported language feature for the current runtime.';
      suggestedFix = 'Check the exact line/column in the stack trace for a missing bracket, quote, comma, or unsupported syntax, and run the file through a linter.';
    } else if (text.includes('memory') || text.includes('heap')) {
      severity = 'CRITICAL';
      possibleCause = 'The process exceeded its available memory, often due to an unbounded loop, large payload, or a memory leak.';
      explanation = 'Memory-related crashes usually stem from processing data structures that grow without bound (e.g. accumulating results in a loop that never terminates, or caching without eviction).';
      suggestedFix = 'Profile memory usage, add pagination/streaming for large data sets, and verify loops have correct termination conditions.';
    }

    const confidence = Math.min(96, 60 + (errorMessage ? 15 : 0) + (stackTrace ? 15 : 0) + Math.floor(Math.random() * 8));
    const fixedCode = buildImprovedCodeStub(code, language, true);

    return { severity, possibleCause, explanation, suggestedFix, fixedCode, confidence, provider: 'mock' };
  }

  async generateCommitMessage({ changedFiles = [], diff = '', description = '' }) {
    await simulateLatency();

    const text = `${description} ${diff}`.toLowerCase();
    let commitType = 'chore';
    if (/fix|bug|error|crash/.test(text)) commitType = 'fix';
    else if (/test|spec/.test(text)) commitType = 'test';
    else if (/doc|readme/.test(text)) commitType = 'docs';
    else if (/refactor|rename|restructure|clean/.test(text)) commitType = 'refactor';
    else if (/perf|optimi[sz]e|speed|latency/.test(text)) commitType = 'perf';
    else if (/add|implement|introduce|new feature|feature/.test(text)) commitType = 'feat';

    const scope = guessScope(changedFiles);
    const shortDescription = description
      ? description.trim().replace(/\.$/, '').slice(0, 72)
      : `update ${scope || 'project files'}`;

    const commitMessage = `${commitType}${scope ? `(${scope})` : ''}: ${shortDescription.toLowerCase()}`;

    const summary = description
      ? `This commit ${description.trim().replace(/\.$/, '')}.`
      : `This commit updates ${changedFiles.length || 'the affected'} file(s) in ${scope || 'the project'}.`;

    const fileList = changedFiles.length ? changedFiles.join(', ') : 'the changed files';
    const detailedExplanation = [
      `Files changed: ${fileList}.`,
      diff ? 'The diff introduces changes to existing logic; review the affected functions for side effects.' : 'No diff was supplied — this message is based on the description provided.',
      `Classified as a "${commitType}" change based on the description/diff content.`,
    ].join(' ');

    return { commitType, commitMessage, summary, detailedExplanation, provider: 'mock' };
  }
}

function guessScope(changedFiles) {
  if (!changedFiles || changedFiles.length === 0) return '';
  const first = changedFiles[0];
  const parts = first.split('/');
  if (parts.length > 1) return parts[0];
  const base = parts[0].split('.')[0];
  return base;
}

function buildImprovedCodeStub(code, language, isFix = false) {
  const header = isFix
    ? `// --- Suggested fix (mock AI) ---\n`
    : `// --- Suggested improvements (mock AI) ---\n`;
  const note = isFix
    ? `// Added a guard clause and error handling around the risky operation.\n`
    : `// Consider: clearer naming, guard clauses, and extracted helper functions.\n`;
  return `${header}${note}${code}`;
}

function simulateLatency() {
  const ms = 400 + Math.floor(Math.random() * 500);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = MockAIService;
