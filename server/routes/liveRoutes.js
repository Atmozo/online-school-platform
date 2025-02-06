// routes/liveRoutes.js
const express = require('express');
const router = express.Router();

// A simple endpoint to provide info about the live class feature.
// You might expand this later with additional functionality.
router.get('/', (req, res) => {
  res.json({ message: "Welcome to the live class endpoint. Use Socket.IO for real-time video and chat." });
});

module.exports = router;
