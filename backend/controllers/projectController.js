const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityService');
const { getNotificationService } = require('../services/notifications');

async function assertProjectAccess(project, userId, res) {
  if (!project) {
    ApiResponse.error(res, { message: 'Project not found', statusCode: 404 });
    return false;
  }
  if (!project.isMember(userId)) {
    ApiResponse.error(res, { message: 'You do not have access to this project', statusCode: 403 });
    return false;
  }
  return true;
}

// GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    isArchived: false,
  })
    .populate('owner', 'fullName username avatarColor')
    .populate('members.user', 'fullName username avatarColor role')
    .sort({ updatedAt: -1 });

  return ApiResponse.success(res, { message: 'Projects retrieved', data: { projects } });
});

// GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'fullName username avatarColor email title')
    .populate('members.user', 'fullName username avatarColor role email title');

  if (!(await assertProjectAccess(project, req.user._id, res))) return;

  return ApiResponse.success(res, { message: 'Project retrieved', data: { project } });
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, deadline, color } = req.body;

  if (!name || !name.trim()) {
    return ApiResponse.error(res, { message: 'Project name is required', statusCode: 400 });
  }

  const project = await Project.create({
    name: name.trim(),
    description: description || '',
    status: status || 'PLANNING',
    deadline: deadline || undefined,
    color: color || undefined,
    owner: req.user._id,
    members: [],
  });

  await logActivity({
    projectId: project._id,
    actor: req.user,
    action: 'created the project',
    targetType: 'PROJECT',
    targetLabel: project.name,
  });

  return ApiResponse.success(res, { message: 'Project created successfully', statusCode: 201, data: { project } });
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!(await assertProjectAccess(project, req.user._id, res))) return;

  const role = project.roleOf(req.user._id);
  if (!['ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    return ApiResponse.error(res, { message: 'Only project admins or managers can edit this project', statusCode: 403 });
  }

  const { name, description, status, deadline, color, isArchived } = req.body;
  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (deadline !== undefined) project.deadline = deadline;
  if (color !== undefined) project.color = color;
  if (isArchived !== undefined) project.isArchived = isArchived;

  await project.save();

  await logActivity({
    projectId: project._id,
    actor: req.user,
    action: 'updated the project',
    targetType: 'PROJECT',
    targetLabel: project.name,
  });

  return ApiResponse.success(res, { message: 'Project updated successfully', data: { project } });
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return ApiResponse.error(res, { message: 'Project not found', statusCode: 404 });

  if (String(project.owner) !== String(req.user._id) && req.user.role !== 'ADMIN') {
    return ApiResponse.error(res, { message: 'Only the project owner can delete this project', statusCode: 403 });
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();

  return ApiResponse.success(res, { message: 'Project deleted successfully', data: {} });
});

// POST /api/projects/:id/members
const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!(await assertProjectAccess(project, req.user._id, res))) return;

  const role = project.roleOf(req.user._id);
  if (!['ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    return ApiResponse.error(res, { message: 'Only project admins or managers can add members', statusCode: 403 });
  }

  const { email, username, role: memberRole } = req.body;
  if (!email && !username) {
    return ApiResponse.error(res, { message: 'Provide an email or username to add a member', statusCode: 400 });
  }

  const user = await User.findOne(email ? { email: String(email).toLowerCase() } : { username });
  if (!user) {
    return ApiResponse.error(res, { message: 'No user found with that email/username', statusCode: 404 });
  }

  if (project.isMember(user._id)) {
    return ApiResponse.error(res, { message: 'This user is already a member of the project', statusCode: 409 });
  }

  project.members.push({ user: user._id, role: memberRole || 'DEVELOPER' });
  await project.save();

  const notifier = getNotificationService();
  await notifier.notify({
    userId: user._id,
    type: 'NEW_TEAM_MEMBER',
    title: 'Added to a project',
    message: `You were added to "${project.name}" by ${req.user.fullName}.`,
    link: `/projects/${project._id}`,
    relatedProjectId: project._id,
  });

  await logActivity({
    projectId: project._id,
    actor: req.user,
    action: `added ${user.fullName} to the project`,
    targetType: 'MEMBER',
    targetLabel: user.fullName,
  });

  const populated = await project.populate('members.user', 'fullName username avatarColor role email title');
  return ApiResponse.success(res, { message: 'Member added successfully', data: { project: populated } });
});

// DELETE /api/projects/:id/members/:userId
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!(await assertProjectAccess(project, req.user._id, res))) return;

  const role = project.roleOf(req.user._id);
  if (!['ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    return ApiResponse.error(res, { message: 'Only project admins or managers can remove members', statusCode: 403 });
  }

  project.members = project.members.filter((m) => String(m.user) !== String(req.params.userId));
  await project.save();

  return ApiResponse.success(res, { message: 'Member removed successfully', data: { project } });
});

// PUT /api/projects/:id/members/:userId (role change)
const updateMemberRole = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!(await assertProjectAccess(project, req.user._id, res))) return;

  const role = project.roleOf(req.user._id);
  if (!['ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    return ApiResponse.error(res, { message: 'Only project admins or managers can change member roles', statusCode: 403 });
  }

  const member = project.members.find((m) => String(m.user) === String(req.params.userId));
  if (!member) return ApiResponse.error(res, { message: 'Member not found on this project', statusCode: 404 });

  member.role = req.body.role || member.role;
  await project.save();

  return ApiResponse.success(res, { message: 'Member role updated', data: { project } });
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
