const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

// Runs after express-validator check(...) middlewares; returns a 400 with
// all field errors if any validator failed.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, {
      message: 'Validation failed',
      statusCode: 400,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
