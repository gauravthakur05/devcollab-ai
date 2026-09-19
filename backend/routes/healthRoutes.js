const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

// GET /api/health — used by the frontend/README to confirm the backend is up
// and to confirm the MongoDB connection state.
router.get('/', (req, res) => {
  const dbStateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

  return ApiResponse.success(res, {
    message: 'Backend is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbState,
    },
  });
});

module.exports = router;
