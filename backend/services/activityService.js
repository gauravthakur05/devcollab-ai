const ActivityLog = require('../models/ActivityLog');

/**
 * Writes a single activity feed entry. actorName is snapshotted so the
 * activity feed can render without populating the actor on every read.
 */
async function logActivity({ projectId, actor, action, targetType, targetLabel = '' }) {
  return ActivityLog.create({
    projectId,
    actor: actor._id,
    actorName: actor.fullName,
    action,
    targetType,
    targetLabel,
  });
}

module.exports = { logActivity };
