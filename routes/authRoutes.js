const express = require('express');
const jwt = require('jsonwebtoken');
const Department = require('../models/Department');
const User = require('../models/User');

const router = express.Router();

// Development route to quickly get a JWT for testing/demo without a real login screen
router.post('/dev-login', async (req, res) => {
  try {
    const { role } = req.body; // e.g. 'SUPER_ADMIN' or 'BRANCH_OFFICER'
    const user = await User.findOne({ role }).populate('departmentId');
    
    if (!user) {
      return res.status(404).json({ error: 'No user found with that role for dev-login' });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      departmentId: user.departmentId._id,
      clearanceLevel: user.clearanceLevel
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { name: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
