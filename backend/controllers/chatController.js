const ChatMessage = require('../models/ChatMessage');
const Project = require('../models/Project');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getNotificationService } = require('../services/notifications');

async function assertMember(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { error: { message: 'Project not found', statusCode: 404 } };
  if (!project.isMember(userId)) return { error: { message: 'You do not have access to this project chat', statusCode: 403 } };
  return { project, error: null };
}

// GET /api/chat/:projectId
const getMessages = asyncHandler(async (req, res) => {
  const { error } = await assertMember(req.params.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const messages = await ChatMessage.find({ projectId: req.params.projectId })
    .populate('sender', 'fullName username avatarColor')
    .sort({ createdAt: 1 })
    .limit(200);

  return ApiResponse.success(res, { message: 'Messages retrieved', data: { messages } });
});

// POST /api/chat/:projectId
const sendMessage = asyncHandler(async (req, res) => {
  const { project, error } = await assertMember(req.params.projectId, req.user._id);
  if (error) return ApiResponse.error(res, error);

  const { text } = req.body;
  if (!text || !text.trim()) return ApiResponse.error(res, { message: 'Message text is required', statusCode: 400 });

  const chatMessage = await ChatMessage.create({ projectId: req.params.projectId, sender: req.user._id, text: text.trim() });
  const populated = await chatMessage.populate('sender', 'fullName username avatarColor');

  // Notify other members (best-effort; do not block the response on this).
  const notifier = getNotificationService();
  const recipients = [project.owner, ...project.members.map((m) => m.user)].filter(
    (uid) => String(uid) !== String(req.user._id)
  );
  Promise.all(
    recipients.map((uid) =>
      notifier.notify({
        userId: uid,
        type: 'NEW_CHAT_MESSAGE',
        title: `New message in ${project.name}`,
        message: `${req.user.fullName}: ${text.trim().slice(0, 80)}`,
        link: `/projects/${project._id}/chat`,
        relatedProjectId: project._id,
      })
    )
  ).catch((e) => console.error('[chat] notification error', e.message));

  const io = req.app.get('io');
  if (io) io.to(`project:${req.params.projectId}`).emit('chat:message', populated);

  return ApiResponse.success(res, { message: 'Message sent', statusCode: 201, data: { message: populated } });
});

module.exports = { getMessages, sendMessage };
