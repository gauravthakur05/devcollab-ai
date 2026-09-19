const Task = require('../models/Task');
const Project = require('../models/Project');
const TaskComment = require('../models/TaskComment');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityService');
const { getNotificationService } = require('../services/notifications');
const { TASK_STATUSES, TASK_PRIORITIES } = require('../models/Task');

async function loadProjectForUser(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, error: { message: 'Project not found', statusCode: 404 } };
  if (!project.isMember(userId)) {
    return { project: null, error: { message: 'You do not have access to this project', statusCode: 403 } };
  }
  return { project, error: null };
}

// GET /api/tasks?projectId=...&status=...&sprintId=...&assignedTo=...
const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, sprintId, assignedTo, search } = req.query;

  if (!projectId) {
    return ApiResponse.error(res, { message: 'projectId query parameter is required', statusCode: 400 });
  }

  const { error } = await loadProjectForUser(projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const filter = { projectId };
  if (status) filter.status = status;
  if (sprintId) filter.sprintId = sprintId;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.$text = { $search: search };

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'fullName username avatarColor')
    .populate('createdBy', 'fullName username avatarColor')
    .sort({ order: 1, createdAt: -1 });

  return ApiResponse.success(res, { message: 'Tasks retrieved', data: { tasks } });
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'fullName username avatarColor')
    .populate('createdBy', 'fullName username avatarColor');
  if (!task) return ApiResponse.error(res, { message: 'Task not found', statusCode: 404 });

  const { error } = await loadProjectForUser(task.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const comments = await TaskComment.find({ taskId: task._id })
    .populate('author', 'fullName username avatarColor')
    .sort({ createdAt: 1 });

  return ApiResponse.success(res, { message: 'Task retrieved', data: { task, comments } });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, projectId, sprintId, assignedTo, priority, labels, dueDate, status } = req.body;

  if (!title || !title.trim()) return ApiResponse.error(res, { message: 'Task title is required', statusCode: 400 });
  if (!projectId) return ApiResponse.error(res, { message: 'projectId is required', statusCode: 400 });

  const { project, error } = await loadProjectForUser(projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  if (priority && !TASK_PRIORITIES.includes(priority)) {
    return ApiResponse.error(res, { message: `Invalid priority. Must be one of ${TASK_PRIORITIES.join(', ')}`, statusCode: 400 });
  }
  if (status && !TASK_STATUSES.includes(status)) {
    return ApiResponse.error(res, { message: `Invalid status. Must be one of ${TASK_STATUSES.join(', ')}`, statusCode: 400 });
  }

  const count = await Task.countDocuments({ projectId, status: status || 'BACKLOG' });

  const task = await Task.create({
    title: title.trim(),
    description: description || '',
    projectId,
    sprintId: sprintId || null,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    priority: priority || 'MEDIUM',
    status: status || 'BACKLOG',
    labels: labels || [],
    dueDate: dueDate || null,
    order: count,
  });

  await logActivity({ projectId, actor: req.user, action: `created task "${task.title}"`, targetType: 'TASK', targetLabel: task.title });

  if (assignedTo && String(assignedTo) !== String(req.user._id)) {
    const notifier = getNotificationService();
    await notifier.notify({
      userId: assignedTo,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: `${req.user.fullName} assigned you "${task.title}" in ${project.name}.`,
      link: `/projects/${projectId}/kanban`,
      relatedProjectId: projectId,
    });
  }

  const populated = await task.populate([
    { path: 'assignedTo', select: 'fullName username avatarColor' },
    { path: 'createdBy', select: 'fullName username avatarColor' },
  ]);

  return ApiResponse.success(res, { message: 'Task created successfully', statusCode: 201, data: { task: populated } });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return ApiResponse.error(res, { message: 'Task not found', statusCode: 404 });

  const { project, error } = await loadProjectForUser(task.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const { title, description, status, priority, assignedTo, sprintId, labels, dueDate, order } = req.body;

  if (status && !TASK_STATUSES.includes(status)) {
    return ApiResponse.error(res, { message: `Invalid status. Must be one of ${TASK_STATUSES.join(', ')}`, statusCode: 400 });
  }
  if (priority && !TASK_PRIORITIES.includes(priority)) {
    return ApiResponse.error(res, { message: `Invalid priority. Must be one of ${TASK_PRIORITIES.join(', ')}`, statusCode: 400 });
  }

  const wasAssignedTo = task.assignedTo ? String(task.assignedTo) : null;
  const wasStatus = task.status;

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
  if (sprintId !== undefined) task.sprintId = sprintId || null;
  if (labels !== undefined) task.labels = labels;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (order !== undefined) task.order = order;

  await task.save();

  if (status !== undefined && status !== wasStatus) {
    await logActivity({
      projectId: task.projectId,
      actor: req.user,
      action: `moved task "${task.title}" to ${status.replace('_', ' ')}`,
      targetType: 'TASK',
      targetLabel: task.title,
    });

    if (status === 'DONE' && task.assignedTo) {
      const notifier = getNotificationService();
      await notifier.notify({
        userId: task.assignedTo,
        type: 'TASK_COMPLETED',
        title: 'Task completed',
        message: `"${task.title}" was marked as Done.`,
        link: `/projects/${task.projectId}/kanban`,
        relatedProjectId: task.projectId,
      });
    }
  }

  if (assignedTo !== undefined && assignedTo && String(assignedTo) !== wasAssignedTo) {
    const notifier = getNotificationService();
    await notifier.notify({
      userId: assignedTo,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: `${req.user.fullName} assigned you "${task.title}"${project ? ` in ${project.name}` : ''}.`,
      link: `/projects/${task.projectId}/kanban`,
      relatedProjectId: task.projectId,
    });
  }

  const populated = await task.populate([
    { path: 'assignedTo', select: 'fullName username avatarColor' },
    { path: 'createdBy', select: 'fullName username avatarColor' },
  ]);

  return ApiResponse.success(res, { message: 'Task updated successfully', data: { task: populated } });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return ApiResponse.error(res, { message: 'Task not found', statusCode: 404 });

  const { error } = await loadProjectForUser(task.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  await TaskComment.deleteMany({ taskId: task._id });
  await task.deleteOne();

  return ApiResponse.success(res, { message: 'Task deleted successfully', data: {} });
});

// POST /api/tasks/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return ApiResponse.error(res, { message: 'Task not found', statusCode: 404 });

  const { error } = await loadProjectForUser(task.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const { text } = req.body;
  if (!text || !text.trim()) return ApiResponse.error(res, { message: 'Comment text is required', statusCode: 400 });

  const comment = await TaskComment.create({ taskId: task._id, author: req.user._id, text: text.trim() });
  task.commentsCount += 1;
  await task.save();

  const populated = await comment.populate('author', 'fullName username avatarColor');
  return ApiResponse.success(res, { message: 'Comment added', statusCode: 201, data: { comment: populated } });
});

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, addComment };
