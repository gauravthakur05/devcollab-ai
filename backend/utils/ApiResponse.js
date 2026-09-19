// Consistent success/error envelope for every API response.
class ApiResponse {
  static success(res, { message = 'Success', data = {}, statusCode = 200 } = {}) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static error(res, { message = 'Something went wrong', statusCode = 500, errors = null } = {}) {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
  }
}

module.exports = ApiResponse;
