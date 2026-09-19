const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityService');
const { getNotificationService } = require('../services/notifications');

async function loadProjectForUser(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, error: { message: 'Project not found', statusCode: 404 } };
  if (!project.isMember(userId)) {
    return { project: null, error: { message: 'You do not have access to this project', statusCode: 403 } };
  }
  return { project, error: null };
}

// GET /api/sprints?projectId=...
const getSprints = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return ApiResponse.error(res, { message: 'projectId query parameter is required', statusCode: 400 });

  const { error } = await loadProjectForUser(projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const sprints = await Sprint.find({ projectId }).sort({ startDate: -1 });

  // Attach lightweight progress stats per sprint.
  const withStats = await Promise.all(
    sprints.map(async (sprint) => {
      const tasks = await Task.find({ sprintId: sprint._id }).select('status');
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === 'DONE').length;
      return {
        ...sprint.toObject(),
        stats: {
          totalTasks: total,
          completedTasks: completed,
          remainingTasks: total - completed,
          completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    })
  );

  return ApiResponse.success(res, { message: 'Sprints retrieved', data: { sprints: withStats } });
});

// GET /api/sprints/:id
const getSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) return ApiResponse.error(res, { message: 'Sprint not found', statusCode: 404 });

  const { error } = await loadProjectForUser(sprint.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const tasks = await Task.find({ sprintId: sprint._id })
    .populate('assignedTo', 'fullName username avatarColor')
    .sort({ status: 1 });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'DONE').length;

  return ApiResponse.success(res, {
    message: 'Sprint retrieved',
    data: {
      sprint,
      tasks,
      stats: {
        totalTasks: total,
        completedTasks: completed,
        remainingTasks: total - completed,
        completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    },
  });
});

// POST /api/sprints
const createSprint = asyncHandler(async (req, res) => {
  const { name, goal, projectId, startDate, endDate } = req.body;

  if (!name || !projectId || !startDate || !endDate) {
    return ApiResponse.error(res, { message: 'name, projectId, startDate and endDate are required', statusCode: 400 });
  }
  if (new Date(endDate) <= new Date(startDate)) {
    return ApiResponse.error(res, { message: 'endDate must be after startDate', statusCode: 400 });
  }

  const { error } = await loadProjectForUser(projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const sprint = await Sprint.create({
    name: name.trim(),
    goal: goal || '',
    projectId,
    startDate,
    endDate,
    createdBy: req.user._id,
  });

  await logActivity({ projectId, actor: req.user, action: `created sprint "${sprint.name}"`, targetType: 'SPRINT', targetLabel: sprint.name });

  return ApiResponse.success(res, { message: 'Sprint created successfully', statusCode: 201, data: { sprint } });
});

// PUT /api/sprints/:id
const updateSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) return ApiResponse.error(res, { message: 'Sprint not found', statusCode: 404 });

  const { error } = await loadProjectForUser(sprint.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const { name, goal, startDate, endDate, status } = req.body;
  const wasStatus = sprint.status;

  if (name !== undefined) sprint.name = name.trim();
  if (goal !== undefined) sprint.goal = goal;
  if (startDate !== undefined) sprint.startDate = startDate;
  if (endDate !== undefined) sprint.endDate = endDate;
  if (status !== undefined) sprint.status = status;

  await sprint.save();

  if (status && status !== wasStatus && (status === 'ACTIVE' || status === 'COMPLETED')) {
    const project = await Project.findById(sprint.projectId);
    const notifier = getNotificationService();
    const recipients = [project.owner, ...project.members.map((m) => m.user)];
    const type = status === 'ACTIVE' ? 'SPRINT_STARTED' : 'SPRINT_COMPLETED';
    await Promise.all(
      recipients.map((uid) =>
        notifier.notify({
          userId: uid,
          type,
          title: status === 'ACTIVE' ? 'Sprint started' : 'Sprint completed',
          message: `"${sprint.name}" ${status === 'ACTIVE' ? 'has started' : 'has been completed'} in ${project.name}.`,
          link: `/projects/${sprint.projectId}/sprints`,
          relatedProjectId: sprint.projectId,
        })
      )
    );

    await logActivity({
      projectId: sprint.projectId,
      actor: req.user,
      action: `${status === 'ACTIVE' ? 'started' : 'completed'} sprint "${sprint.name}"`,
      targetType: 'SPRINT',
      targetLabel: sprint.name,
    });
  }

  return ApiResponse.success(res, { message: 'Sprint updated successfully', data: { sprint } });
});

// DELETE /api/sprints/:id
const deleteSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) return ApiResponse.error(res, { message: 'Sprint not found', statusCode: 404 });

  const { error } = await loadProjectForUser(sprint.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  await Task.updateMany({ sprintId: sprint._id }, { $set: { sprintId: null } });
  await sprint.deleteOne();

  return ApiResponse.success(res, { message: 'Sprint deleted successfully', data: {} });
});

module.exports = { getSprints, getSprint, createSprint, updateSprint, deleteSprint };
