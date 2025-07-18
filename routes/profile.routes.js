const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// GET /api/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullName email phoneNumber');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || 'Not provided',
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
