const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = require('../server');
const Department = require('../models/Department');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const AuditLedger = require('../models/AuditLedger');

let mongoServer;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback';

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Function to verify integrity of a ticket's ledger
async function verifyLedgerIntegrity(ticketId) {
  const ledgers = await AuditLedger.find({ ticketId }).sort({ timestamp: 1 });
  let previousHash = 'GENESIS';

  for (const ledger of ledgers) {
    if (ledger.previousHash !== previousHash) {
      return { valid: false, reason: 'Broken Chain: previousHash mismatch' };
    }
    
    const dataString = `${ledger.ticketId.toString()}${ledger.actorId.toString()}${ledger.newState}${ledger.previousHash}${ledger.timestamp.toISOString()}`;
    const calculatedHash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    if (calculatedHash !== ledger.currentHash) {
      return { valid: false, reason: 'Tampering Detected: currentHash mismatch' };
    }

    previousHash = ledger.currentHash;
  }
  return { valid: true };
}

describe('Phase 4: Cryptographic Immutability & Security', () => {
  let departmentId;
  let branchOfficerToken;
  let ticketId;
  let branchUserId;

  it('should setup test environment', async () => {
    const dept = await Department.create({ deptCode: 'D-X', deptName: 'X', category: 'IT', region: 'South' });
    departmentId = dept._id;

    const branchUser = await User.create({ fullName: 'B Officer', email: 'bx@gov.local', hashedPassword: 'pass', departmentId: dept._id, role: 'BRANCH_OFFICER', clearanceLevel: 1 });
    branchUserId = branchUser._id;
    branchOfficerToken = jwt.sign({ userId: branchUser._id, role: branchUser.role, departmentId: branchUser.departmentId }, JWT_SECRET);

    // Create a ticket through API to populate ledger
    const res = await request(app)
      .post('/api/v1/tickets/create')
      .set('Authorization', `Bearer ${branchOfficerToken}`)
      .send({
        ticketNumber: 'TKT-X1',
        category: 'IT',
        subCategory: 'Mouse',
        priority: 'LOW',
        details: {}
      });
    
    ticketId = res.body._id;
  });

  it('should deny BRANCH_OFFICER access to Super Admin feed (HTTP 403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/feed')
      .set('Authorization', `Bearer ${branchOfficerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('should successfully verify the initial cryptographic integrity of the ledger', async () => {
    const integrity = await verifyLedgerIntegrity(ticketId);
    expect(integrity.valid).toBe(true);
  });

  it('should detect database tampering when altering a historical record', async () => {
    const ledgerEntry = await AuditLedger.findOne({ ticketId });
    
    // Simulate direct DB tampering, bypassing Mongoose middleware restrictions
    await mongoose.connection.db.collection('auditledgers').updateOne(
      { _id: ledgerEntry._id },
      { $set: { newState: 'TAMPERED_STATE' } }
    );

    // Run the verifier again
    const integrity = await verifyLedgerIntegrity(ticketId);
    
    expect(integrity.valid).toBe(false);
    expect(integrity.reason).toBe('Tampering Detected: currentHash mismatch');
  });
});
