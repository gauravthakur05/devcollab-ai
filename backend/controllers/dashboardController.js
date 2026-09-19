const Project = require('../models/Project');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const BugReport = require('../models/BugReport');
const ActivityLog = require('../models/ActivityLog');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats
// All numbers here are computed live from MongoDB — nothing is hard-coded.
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const myProjects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
    isArchived: false,
  }).select('_id status members owner name color');

  const projectIds = myProjects.map((p) => p._id);

  const [totalTasksAssigned, tasksCompleted, openBugsCount, activeSprints] = await Promise.all([
    Task.countDocuments({ projectId: { $in: projectIds } }),
    Task.countDocuments({ projectId: { $in: projectIds }, status: 'DONE' }),
    BugReport.countDocuments({ userId }),
    Sprint.find({ projectId: { $in: projectIds }, status: 'ACTIVE' }),
  ]);

  const teamMemberIds = new Set();
  myProjects.forEach((p) => {
    teamMemberIds.add(String(p.owner));
    p.members.forEach((m) => teamMemberIds.add(String(m.user)));
  });

  const activeProjects = myProjects.filter((p) => p.status === 'ACTIVE').length;

  // Sprint progress across all active sprints in the user's projects.
  let sprintProgress = 0;
  if (activeSprints.length > 0) {
    const sprintIds = activeSprints.map((s) => s._id);
    const sprintTasks = await Task.find({ sprintId: { $in: sprintIds } }).select('status');
    const done = sprintTasks.filter((t) => t.status === 'DONE').length;
    sprintProgress = sprintTasks.length > 0 ? Math.round((done / sprintTasks.length) * 100) : 0;
  }

  // Task distribution by status (for a chart)
  const distributionAgg = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const taskDistribution = distributionAgg.reduce((acc, d) => ({ ...acc, [d._id]: d.count }), {});

  const recentActivity = await ActivityLog.find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .limit(10);

  const recentNotifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(5);

  return ApiResponse.success(res, {
    message: 'Dashboard statistics retrieved',
    data: {
      stats: {
        totalProjects: myProjects.length,
        activeProjects,
        tasksCompleted,
        openBugs: openBugsCount,
        teamMembers: teamMemberIds.size,
        currentSprintProgress: sprintProgress,
        totalTasksAssigned,
      },
      taskDistribution,
      recentActivity,
      recentNotifications,
      projects: myProjects,
    },
  });
});

module.exports = { getStats };
