const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const crypto = require('crypto');

const Department = require('../models/Department');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const AuditLedger = require('../models/AuditLedger');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase 1: Mongoose Models & Tamper-Evident Ledger', () => {
  let departmentId;
  let userId;
  let ticketId;

  it('should successfully create a Department', async () => {
    const dept = new Department({
      deptCode: 'DEPT-0842',
      deptName: 'Main Logistics',
      category: 'Logistics',
      region: 'East Coast'
    });
    const savedDept = await dept.save();
    departmentId = savedDept._id;
    expect(savedDept.deptCode).toBe('DEPT-0842');
  });

  it('should fail to create a Department with missing required fields', async () => {
    const dept = new Department({ deptName: 'Incomplete Dept' });
    await expect(dept.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should successfully create a User with proper references and ABAC/RBAC', async () => {
    const user = new User({
      fullName: 'John Doe',
      email: 'john.doe@govrms.local',
      hashedPassword: 'hashedpassword123',
      departmentId: departmentId,
      role: 'BRANCH_OFFICER',
      clearanceLevel: 3,
      assignedRegion: 'East Coast'
    });
    const savedUser = await user.save();
    userId = savedUser._id;
    expect(savedUser.email).toBe('john.doe@govrms.local');
    expect(savedUser.role).toBe('BRANCH_OFFICER');
  });

  it('should successfully create a Ticket', async () => {
    const ticket = new Ticket({
      ticketNumber: 'TKT-1001',
      initiatorId: userId,
      departmentId: departmentId,
      category: 'IT',
      subCategory: 'Hardware Request',
      priority: 'HIGH',
      details: { item: 'Laptop', justification: 'Broken screen' },
      status: 'SUBMITTED',
      attachments: [{ uri: 's3://bucket/file.pdf', fileSha256: 'abc123sha256' }]
    });
    const savedTicket = await ticket.save();
    ticketId = savedTicket._id;
    expect(savedTicket.ticketNumber).toBe('TKT-1001');
    expect(savedTicket.priority).toBe('HIGH');
  });

  it('should successfully create an AuditLedger entry and calculate SHA-256 currentHash', async () => {
    const timestamp = new Date();
    const ledger = new AuditLedger({
      ticketId: ticketId,
      action: 'SUBMISSION',
      actorId: userId,
      previousState: 'NONE',
      newState: 'SUBMITTED',
      timestamp: timestamp,
      previousHash: 'GENESIS'
    });
    const savedLedger = await ledger.save();

    // Verify properties
    expect(savedLedger.previousHash).toBe('GENESIS');
    expect(savedLedger.currentHash).toBeDefined();

    // Manually calculate hash to verify tamper-evidence logic
    const dataString = `${ticketId.toString()}${userId.toString()}SUBMITTEDGENESIS${timestamp.toISOString()}`;
    const expectedHash = crypto.createHash('sha256').update(dataString).digest('hex');

    expect(savedLedger.currentHash).toBe(expectedHash);
  });

  it('should prevent modifications to an existing AuditLedger document (append-only)', async () => {
    const ledger = await AuditLedger.findOne({ ticketId: ticketId });
    expect(ledger).not.toBeNull();

    // Try to update using updateOne
    await expect(
      AuditLedger.updateOne({ _id: ledger._id }, { newState: 'TAMPERED_STATE' })
    ).rejects.toThrow('AuditLedger documents cannot be updated.');
  });
});
