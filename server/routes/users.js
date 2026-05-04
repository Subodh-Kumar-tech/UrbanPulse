const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (for Admin dashboard)
router.get('/', async (req, res) => {
  try {
    // Exclude password field for security
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
