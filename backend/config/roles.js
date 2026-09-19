// Central place for role names so they are never hard-coded/typo'd across the app.
const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  DEVELOPER: 'DEVELOPER',
  VIEWER: 'VIEWER',
});

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };
