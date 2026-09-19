const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 chars, one letter, one number.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

function isStrongPassword(password) {
  return typeof password === 'string' && PASSWORD_REGEX.test(password);
}

module.exports = { isValidEmail, isStrongPassword };
