const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth');
const { getAdminFeed } = require('../controllers/adminController');

const router = express.Router();

router.use(verifyJWT);

// Super Admin feed
router.get('/feed', 
  requireRole('SUPER_ADMIN', 'REGIONAL_DIRECTOR'), 
  getAdminFeed
);

module.exports = router;
