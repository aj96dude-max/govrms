const jwt = require('jsonwebtoken');

// Simple memory-based token blacklist (use Redis in production)
const tokenBlacklist = new Set();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback';

exports.verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Token invalid/logged out' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Should contain userId, role, departmentId, clearanceLevel
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

exports.abacGatekeeper = (req, res, next) => {
  // If user is BRANCH_OFFICER, ensure the departmentId matches
  if (req.user.role === 'BRANCH_OFFICER') {
    const targetDeptId = req.body.departmentId || req.query.departmentId;
    if (targetDeptId && targetDeptId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Forbidden: ABAC violation - department mismatch' });
    }
    // Automatically attach user dept to req.body for safety
    req.body.departmentId = req.user.departmentId;
  }
  next();
};

exports.blacklistToken = (token) => {
  tokenBlacklist.add(token);
};
