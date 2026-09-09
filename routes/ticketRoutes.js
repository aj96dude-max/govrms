const express = require('express');
const { verifyJWT, requireRole, abacGatekeeper } = require('../middleware/auth');
const { createTicket, endorseTicket, clearTicket } = require('../controllers/ticketWorkflowController');

const router = express.Router();

router.use(verifyJWT);

// Create ticket (Branch Officers & up)
router.post('/create', 
  requireRole('BRANCH_OFFICER', 'LINE_MANAGER', 'REGIONAL_DIRECTOR', 'SUPER_ADMIN'), 
  abacGatekeeper, 
  createTicket
);

// Endorse ticket (Line Managers & up)
router.put('/:id/endorse', 
  requireRole('LINE_MANAGER', 'REGIONAL_DIRECTOR', 'SUPER_ADMIN'), 
  endorseTicket
);

// Clear ticket (Super Admin only)
router.put('/:id/clear', 
  requireRole('SUPER_ADMIN'), 
  clearTicket
);

module.exports = router;
