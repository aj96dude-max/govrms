const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

const app = require('../server');
const Department = require('../models/Department');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const AuditLedger = require('../models/AuditLedger');

let mongoServer;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback';

beforeAll(async () => {
  // Use Replica Set for Transaction support
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase 2: Secure Backend API & Routing Engine', () => {
  let departmentId;
  let otherDepartmentId;
  let branchOfficerId;
  let lineManagerId;
  let superAdminId;
  let branchOfficerToken;
  let lineManagerToken;
  let superAdminToken;
  let ticketId;

  it('should setup initial data and tokens', async () => {
    const dept1 = await Department.create({ deptCode: 'D-01', deptName: 'Logistics', category: 'Logistics', region: 'North' });
    const dept2 = await Department.create({ deptCode: 'D-02', deptName: 'IT', category: 'IT', region: 'North' });
    departmentId = dept1._id;
    otherDepartmentId = dept2._id;

    const branchUser = await User.create({ fullName: 'Branch Off', email: 'bo@gov.local', hashedPassword: 'pass', departmentId: dept1._id, role: 'BRANCH_OFFICER', clearanceLevel: 1 });
    const lineMgrUser = await User.create({ fullName: 'Line Mgr', email: 'lm@gov.local', hashedPassword: 'pass', departmentId: dept1._id, role: 'LINE_MANAGER', clearanceLevel: 3 });
    const superAdminUser = await User.create({ fullName: 'Super Admin', email: 'sa@gov.local', hashedPassword: 'pass', departmentId: dept1._id, role: 'SUPER_ADMIN', clearanceLevel: 5 });

    branchOfficerId = branchUser._id;
    lineManagerId = lineMgrUser._id;
    superAdminId = superAdminUser._id;

    branchOfficerToken = jwt.sign({ userId: branchUser._id, role: branchUser.role, departmentId: branchUser.departmentId }, JWT_SECRET);
    lineManagerToken = jwt.sign({ userId: lineMgrUser._id, role: lineMgrUser.role, departmentId: lineMgrUser.departmentId }, JWT_SECRET);
    superAdminToken = jwt.sign({ userId: superAdminUser._id, role: superAdminUser.role, departmentId: superAdminUser.departmentId }, JWT_SECRET);
  });

  it('should allow BRANCH_OFFICER to create a ticket', async () => {
    const res = await request(app)
      .post('/api/v1/tickets/create')
      .set('Authorization', `Bearer ${branchOfficerToken}`)
      .send({
        ticketNumber: 'TKT-100',
        category: 'Supplies',
        subCategory: 'Paper',
        priority: 'LOW',
        details: { amount: 100 }
      });

    expect(res.status).toBe(201);
    expect(res.body.ticketNumber).toBe('TKT-100');
    expect(res.body.status).toBe('SUBMITTED');
    ticketId = res.body._id;

    // Verify ledger
    const ledgerEntry = await AuditLedger.findOne({ ticketId });
    expect(ledgerEntry).not.toBeNull();
    expect(ledgerEntry.action).toBe('SUBMISSION');
    expect(ledgerEntry.currentHash).toBeDefined();
  });

  it('should block BRANCH_OFFICER from creating ticket for another department (ABAC)', async () => {
    const res = await request(app)
      .post('/api/v1/tickets/create')
      .set('Authorization', `Bearer ${branchOfficerToken}`)
      .send({
        ticketNumber: 'TKT-101',
        departmentId: otherDepartmentId.toString(),
        category: 'IT',
        subCategory: 'Monitor',
        priority: 'LOW',
        details: {}
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('department mismatch');
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).put(`/api/v1/tickets/${ticketId}/endorse`);
    expect(res.status).toBe(401);
  });

  it('should block BRANCH_OFFICER from endorsing a ticket (RBAC)', async () => {
    const res = await request(app)
      .put(`/api/v1/tickets/${ticketId}/endorse`)
      .set('Authorization', `Bearer ${branchOfficerToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow LINE_MANAGER to endorse a ticket (Transactions working)', async () => {
    const res = await request(app)
      .put(`/api/v1/tickets/${ticketId}/endorse`)
      .set('Authorization', `Bearer ${lineManagerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('LINE_MANAGER_APPROVED');

    // Verify ledger hash chain
    const ledgers = await AuditLedger.find({ ticketId }).sort({ timestamp: 1 });
    expect(ledgers.length).toBe(2);
    expect(ledgers[1].action).toBe('ENDORSEMENT');
    expect(ledgers[1].previousHash).toBe(ledgers[0].currentHash);
  });

  it('should block LINE_MANAGER from getting Super Admin feed (RBAC)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/feed')
      .set('Authorization', `Bearer ${lineManagerToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow SUPER_ADMIN to get admin feed with Aggregation Pipeline', async () => {
    const res = await request(app)
      .get('/api/v1/admin/feed')
      .set('Authorization', `Bearer ${superAdminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].departmentInfo.deptCode).toBe('D-01');
    expect(res.body.data[0].initiatorInfo.fullName).toBe('Branch Off');
  });

  it('should allow SUPER_ADMIN to clear a ticket', async () => {
    const res = await request(app)
      .put(`/api/v1/tickets/${ticketId}/clear`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('RESOLVED');

    const ledgers = await AuditLedger.find({ ticketId }).sort({ timestamp: 1 });
    expect(ledgers.length).toBe(3);
    expect(ledgers[2].action).toBe('FULFILLMENT');
    expect(ledgers[2].previousHash).toBe(ledgers[1].currentHash);
  });
});
