/**
 * Populates MongoDB with realistic demo data: users, projects, tasks,
 * sprints, chat messages, notifications, AI review examples and bug
 * reports. Safe to re-run — it wipes DevCollab's own collections first
 * (never touches unrelated collections in the same database).
 *
 * Usage: npm run seed   (from the backend/ directory, with .env configured)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const TaskComment = require('../models/TaskComment');
const Sprint = require('../models/Sprint');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const AIReview = require('../models/AIReview');
const BugReport = require('../models/BugReport');
const CommitGeneration = require('../models/CommitGeneration');
const ActivityLog = require('../models/ActivityLog');

const DEMO_PASSWORD = 'Demo@123';

async function seed() {
  await connectDB();
  console.log('[seed] Connected. Clearing existing DevCollab data...');

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    TaskComment.deleteMany({}),
    Sprint.deleteMany({}),
    ChatMessage.deleteMany({}),
    Notification.deleteMany({}),
    AIReview.deleteMany({}),
    BugReport.deleteMany({}),
    CommitGeneration.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  console.log('[seed] Creating users...');
  const userDefs = [
    { fullName: 'Demo User', username: 'demo', email: 'demo@devcollab.com', role: 'ADMIN', title: 'Platform Admin', avatarColor: '#6E56CF' },
    { fullName: 'Ava Patel', username: 'ava.patel', email: 'ava@devcollab.com', role: 'PROJECT_MANAGER', title: 'Senior PM', avatarColor: '#22D3AA' },
    { fullName: 'Liam Chen', username: 'liam.chen', email: 'liam@devcollab.com', role: 'DEVELOPER', title: 'Backend Engineer', avatarColor: '#3B82F6' },
    { fullName: 'Sofia Rossi', username: 'sofia.rossi', email: 'sofia@devcollab.com', role: 'DEVELOPER', title: 'Frontend Engineer', avatarColor: '#F59E0B' },
    { fullName: 'Noah Kim', username: 'noah.kim', email: 'noah@devcollab.com', role: 'DEVELOPER', title: 'Full-stack Engineer', avatarColor: '#EF4444' },
    { fullName: 'Maya Singh', username: 'maya.singh', email: 'maya@devcollab.com', role: 'DEVELOPER', title: 'DevOps Engineer', avatarColor: '#A855F7' },
    { fullName: 'Ethan Brooks', username: 'ethan.brooks', email: 'ethan@devcollab.com', role: 'VIEWER', title: 'Product Stakeholder', avatarColor: '#14B8A6' },
    { fullName: 'Grace Wu', username: 'grace.wu', email: 'grace@devcollab.com', role: 'DEVELOPER', title: 'QA Engineer', avatarColor: '#EC4899' },
  ];

  const users = [];
  for (const def of userDefs) {
    const user = await User.create({ ...def, password: DEMO_PASSWORD });
    users.push(user);
  }
  const [demo, ava, liam, sofia, noah, maya, ethan, grace] = users;

  console.log('[seed] Creating projects...');
  const projectDefs = [
    {
      name: 'Nimbus API Gateway',
      description: 'A high-throughput API gateway with rate limiting, auth, and observability for the Nimbus platform.',
      status: 'ACTIVE',
      color: '#6E56CF',
      owner: demo._id,
      deadline: daysFromNow(45),
      members: [
        { user: ava._id, role: 'PROJECT_MANAGER' },
        { user: liam._id, role: 'DEVELOPER' },
        { user: maya._id, role: 'DEVELOPER' },
        { user: grace._id, role: 'DEVELOPER' },
      ],
    },
    {
      name: 'Aurora Design System',
      description: 'Shared component library and design tokens powering all internal SaaS products.',
      status: 'ACTIVE',
      color: '#22D3AA',
      owner: ava._id,
      deadline: daysFromNow(30),
      members: [
        { user: demo._id, role: 'ADMIN' },
        { user: sofia._id, role: 'DEVELOPER' },
        { user: noah._id, role: 'DEVELOPER' },
        { user: ethan._id, role: 'VIEWER' },
      ],
    },
    {
      name: 'Pulse Mobile App',
      description: 'React Native companion app for real-time team notifications and quick task triage.',
      status: 'PLANNING',
      color: '#F59E0B',
      owner: demo._id,
      deadline: daysFromNow(90),
      members: [
        { user: noah._id, role: 'DEVELOPER' },
        { user: grace._id, role: 'DEVELOPER' },
      ],
    },
  ];

  const projects = [];
  for (const def of projectDefs) {
    const project = await Project.create(def);
    projects.push(project);
  }
  const [nimbus, aurora, pulse] = projects;

  console.log('[seed] Creating sprints...');
  const sprintNimbus1 = await Sprint.create({
    name: 'Sprint 12 — Rate Limiting',
    goal: 'Ship token-bucket rate limiting per API key with configurable tiers.',
    projectId: nimbus._id,
    startDate: daysFromNow(-14),
    endDate: daysFromNow(0),
    status: 'ACTIVE',
    createdBy: ava._id,
  });
  const sprintNimbus0 = await Sprint.create({
    name: 'Sprint 11 — Auth Hardening',
    goal: 'Rotate signing keys and add refresh-token support.',
    projectId: nimbus._id,
    startDate: daysFromNow(-28),
    endDate: daysFromNow(-14),
    status: 'COMPLETED',
    createdBy: ava._id,
  });
  const sprintAurora1 = await Sprint.create({
    name: 'Sprint 5 — Theming Tokens',
    goal: 'Finalize light/dark token sets and publish v2 of the theme package.',
    projectId: aurora._id,
    startDate: daysFromNow(-7),
    endDate: daysFromNow(7),
    status: 'ACTIVE',
    createdBy: demo._id,
  });

  console.log('[seed] Creating tasks (20+)...');
  const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'DONE'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const nimbusTasks = [
    ['Design token-bucket rate limiter', 'IN_PROGRESS', 'HIGH', liam, sprintNimbus1, ['backend', 'core']],
    ['Add per-API-key tier configuration', 'TODO', 'MEDIUM', liam, sprintNimbus1, ['backend']],
    ['Wire rate limiter into gateway middleware', 'TODO', 'HIGH', maya, sprintNimbus1, ['backend', 'infra']],
    ['Write integration tests for 429 responses', 'BACKLOG', 'MEDIUM', grace, sprintNimbus1, ['testing']],
    ['Add Prometheus metrics for request latency', 'CODE_REVIEW', 'MEDIUM', maya, sprintNimbus1, ['observability']],
    ['Refresh token rotation', 'DONE', 'CRITICAL', liam, sprintNimbus0, ['security']],
    ['Rotate JWT signing keys', 'DONE', 'CRITICAL', liam, sprintNimbus0, ['security']],
    ['Document gateway auth flow', 'DONE', 'LOW', ava, sprintNimbus0, ['docs']],
    ['Investigate intermittent 502s under load', 'TESTING', 'CRITICAL', maya, sprintNimbus1, ['bug', 'infra']],
    ['Add request ID propagation for tracing', 'BACKLOG', 'LOW', grace, null, ['observability']],
    ['Cache API key lookups in Redis', 'BACKLOG', 'MEDIUM', liam, null, ['performance']],
  ];

  const auroraTasks = [
    ['Define color token scale (50–900)', 'DONE', 'MEDIUM', sofia, sprintAurora1, ['design']],
    ['Build dark mode token overrides', 'IN_PROGRESS', 'HIGH', sofia, sprintAurora1, ['design']],
    ['Publish @aurora/theme v2 to registry', 'TODO', 'HIGH', noah, sprintAurora1, ['release']],
    ['Add Storybook docs for Button variants', 'TODO', 'LOW', sofia, sprintAurora1, ['docs']],
    ['Fix focus ring contrast on dark backgrounds', 'CODE_REVIEW', 'MEDIUM', noah, sprintAurora1, ['accessibility', 'bug']],
    ['Audit component library for a11y issues', 'BACKLOG', 'MEDIUM', ethan, null, ['accessibility']],
    ['Migrate legacy components to new tokens', 'BACKLOG', 'LOW', noah, null, ['refactor']],
    ['Set up visual regression testing', 'TODO', 'MEDIUM', sofia, null, ['testing']],
  ];

  const pulseTasks = [
    ['Scaffold React Native project', 'DONE', 'MEDIUM', noah, null, ['setup']],
    ['Design push notification payload schema', 'IN_PROGRESS', 'HIGH', grace, null, ['backend']],
    ['Build task triage swipe UI', 'BACKLOG', 'MEDIUM', noah, null, ['mobile']],
    ['Set up EAS build pipeline', 'BACKLOG', 'LOW', grace, null, ['infra']],
  ];

  let created = 0;
  async function createTasksFor(project, defs, createdBy) {
    const counters = {};
    for (const [title, status, priority, assignee, sprint, labels] of defs) {
      counters[status] = (counters[status] || 0) + 1;
      const task = await Task.create({
        title,
        description: `${title}. Part of the ${project.name} roadmap.`,
        projectId: project._id,
        sprintId: sprint ? sprint._id : null,
        assignedTo: assignee ? assignee._id : null,
        createdBy: createdBy._id,
        status,
        priority,
        labels,
        dueDate: status === 'DONE' ? null : daysFromNow(Math.floor(Math.random() * 20) + 1),
        order: counters[status] - 1,
        commentsCount: 0,
      });
      created += 1;

      if (Math.random() > 0.6) {
        await TaskComment.create({
          taskId: task._id,
          author: createdBy._id,
          text: pickRandom([
            'Let\'s sync on this during standup tomorrow.',
            'Blocked on the API contract — following up with backend.',
            'Nice progress, left a couple of comments on the PR.',
            'This is ready for review.',
          ]),
        });
        task.commentsCount = 1;
        await task.save();
      }
    }
  }

  await createTasksFor(nimbus, nimbusTasks, ava);
  await createTasksFor(aurora, auroraTasks, demo);
  await createTasksFor(pulse, pulseTasks, demo);
  console.log(`[seed] Created ${created} tasks.`);

  console.log('[seed] Creating chat messages...');
  const nimbusChat = [
    [liam, 'Pushed the token-bucket implementation, would love a review when someone has time.'],
    [maya, 'On it — will look after I finish the metrics dashboard.'],
    [ava, 'Great, this unblocks the tier configuration work too.'],
    [grace, 'Integration tests are passing locally against the new middleware.'],
    [liam, 'Awesome, merging once CI is green.'],
  ];
  for (const [user, text] of nimbusChat) {
    await ChatMessage.create({ projectId: nimbus._id, sender: user._id, text });
  }
  const auroraChat = [
    [sofia, 'Dark mode tokens are looking solid, screenshots incoming.'],
    [noah, 'Can we bump the focus ring contrast fix into this sprint?'],
    [demo, 'Yes, let\'s prioritize it — accessibility audit is coming up.'],
  ];
  for (const [user, text] of auroraChat) {
    await ChatMessage.create({ projectId: aurora._id, sender: user._id, text });
  }

  console.log('[seed] Creating notifications...');
  const notifDefs = [
    [demo, 'TASK_ASSIGNED', 'New task assigned', 'Ava assigned you "Investigate intermittent 502s under load".', `/projects/${nimbus._id}/kanban`, nimbus._id],
    [demo, 'CODE_REVIEW_COMPLETED', 'Code review complete', 'Your AI code review finished with a quality score of 82/100.', '/ai/code-review', null],
    [demo, 'NEW_CHAT_MESSAGE', 'New message in Nimbus API Gateway', 'Liam: Pushed the token-bucket implementation...', `/projects/${nimbus._id}/chat`, nimbus._id],
    [demo, 'SPRINT_STARTED', 'Sprint started', '"Sprint 12 — Rate Limiting" has started in Nimbus API Gateway.', `/projects/${nimbus._id}/sprints`, nimbus._id],
    [ava, 'TASK_COMPLETED', 'Task completed', '"Rotate JWT signing keys" was marked as Done.', `/projects/${nimbus._id}/kanban`, nimbus._id],
    [sofia, 'MENTION', 'You were mentioned', 'Noah mentioned you in a comment on "Fix focus ring contrast".', `/projects/${aurora._id}/kanban`, aurora._id],
  ];
  for (const [user, type, title, message, link, projectId] of notifDefs) {
    await Notification.create({ userId: user._id, type, title, message, link, relatedProjectId: projectId, isRead: Math.random() > 0.6 });
  }

  console.log('[seed] Creating AI review / bug report / commit examples...');
  await AIReview.create({
    userId: demo._id,
    projectId: nimbus._id,
    language: 'javascript',
    code: `function rateLimiter(req, res, next) {\n  var key = req.headers['x-api-key'];\n  if (key == undefined) {\n    return res.status(401).send('no key');\n  }\n  next();\n}`,
    qualityScore: 78,
    complexity: 'LOW',
    maintainability: 'MODERATE',
    findings: {
      bugs: ['Loose equality (==) detected; this can cause unexpected type coercion bugs.'],
      securityIssues: ['No obvious security red flags found in this snippet.'],
      performanceIssues: ['No obvious performance bottlenecks found for the size of this snippet.'],
      codeSmells: ["Use of 'var' detected; prefer 'const'/'let' for predictable block scoping."],
    },
    suggestions: ['Add unit tests covering the missing-key path.', 'Use strict equality (===) throughout.'],
    improvedCode: `function rateLimiter(req, res, next) {\n  const key = req.headers['x-api-key'];\n  if (!key) {\n    return res.status(401).json({ success: false, message: 'API key required' });\n  }\n  next();\n}`,
    provider: 'mock',
  });

  await BugReport.create({
    userId: demo._id,
    projectId: nimbus._id,
    language: 'javascript',
    code: `const user = await User.findById(id);\nconsole.log(user.email);`,
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'email')",
    stackTrace: 'at getUserEmail (userService.js:14:20)',
    severity: 'HIGH',
    possibleCause: 'Code attempted to access a property on a value that was null/undefined at runtime.',
    explanation: 'User.findById returned null because no user matched the given id, and the code accessed .email without checking first.',
    suggestedFix: 'Check that user exists before accessing its properties, and return a 404 if it does not.',
    fixedCode: `const user = await User.findById(id);\nif (!user) {\n  throw new AppError('User not found', 404);\n}\nconsole.log(user.email);`,
    confidence: 91,
    provider: 'mock',
  });

  await CommitGeneration.create({
    userId: demo._id,
    projectId: nimbus._id,
    changedFiles: ['backend/middleware/rateLimiter.js', 'backend/routes/gatewayRoutes.js'],
    diff: '+ added token bucket limiter\n+ wired into gateway routes',
    description: 'implement token bucket rate limiting for the API gateway',
    commitType: 'feat',
    commitMessage: 'feat(gateway): implement token bucket rate limiting for the api gateway',
    summary: 'This commit implements token bucket rate limiting for the API gateway.',
    detailedExplanation: 'Files changed: backend/middleware/rateLimiter.js, backend/routes/gatewayRoutes.js. Classified as a "feat" change based on the description/diff content.',
    provider: 'mock',
  });

  console.log('[seed] Creating activity log entries...');
  const activityDefs = [
    [nimbus, ava, 'created the project'],
    [nimbus, liam, 'created task "Design token-bucket rate limiter"'],
    [nimbus, liam, 'moved task "Rotate JWT signing keys" to DONE'],
    [nimbus, ava, 'started sprint "Sprint 12 — Rate Limiting"'],
    [aurora, demo, 'created the project'],
    [aurora, sofia, 'moved task "Define color token scale (50–900)" to DONE'],
    [pulse, demo, 'created the project'],
  ];
  for (const [project, actor, action] of activityDefs) {
    await ActivityLog.create({ projectId: project._id, actor: actor._id, actorName: actor.fullName, action, targetType: 'PROJECT', targetLabel: project.name });
  }

  console.log('\n[seed] Done!');
  console.log('[seed] Demo login credentials:');
  console.log(`         email:    demo@devcollab.com`);
  console.log(`         password: ${DEMO_PASSWORD}`);
  console.log('[seed] (All seeded users share the same password for convenience.)');

  await mongoose.connection.close();
  process.exit(0);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
