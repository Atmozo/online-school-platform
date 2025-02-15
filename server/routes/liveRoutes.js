
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.json({ message: "Welcome to the live class endpoint. Use Socket.IO for real-time video and chat." });
});

module.exports = router;
