require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Department = require('../models/Department');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const AuditLedger = require('../models/AuditLedger');

const DEPARTMENTS = [
  { code: 'FLT-01', name: 'Fleet Management System', cat: 'Fleet Management System', region: 'North' },
  { code: 'ENG-02', name: 'Engineering Division', cat: 'Engineering Division', region: 'South' },
  { code: 'TKT-03', name: 'Ticket Management System', cat: 'Ticket Management System', region: 'HQ' },
  { code: 'CTR-04', name: 'Contract Management System', cat: 'Contract Management System', region: 'East' },
  { code: 'ADM-05', name: 'Administration Division', cat: 'Administration Division', region: 'HQ' },
  { code: 'MKT-06', name: 'Strategic Marketing Division', cat: 'Strategic Marketing Division', region: 'West' },
  { code: 'BNK-07', name: 'Bank Services Division', cat: 'Bank Services Division', region: 'HQ' },
  { code: 'SEC-08', name: 'Security Management', cat: 'Security Management', region: 'All' },
  { code: 'PRC-09', name: 'Procurement Management', cat: 'Procurement Management', region: 'North' },
  { code: 'USR-10', name: 'User Management', cat: 'User Management', region: 'HQ' },
  { code: 'OUT-11', name: 'Outsource Management', cat: 'Outsource Management', region: 'East' },
  { code: 'MIL-12', name: 'Mail Management System', cat: 'Mail Management System', region: 'HQ' },
  { code: 'ADT-13', name: 'Audit Report', cat: 'Audit Report', region: 'HQ' },
  { code: 'STP-14', name: 'Setup', cat: 'Setup', region: 'HQ' }
];

const TICKET_TEMPLATES = {
  'Fleet Management System': ['Armored Transport Servicing', 'Convoy Fuel Requisition - Route B', 'Vehicle Registration Renewal', 'Tire Replacement - Unit 4'],
  'Engineering Division': ['Structural Integrity Assessment - Sector 4', 'HVAC Grid Power Reroute', 'Elevator Maintenance', 'Backup Generator Refueling'],
  'Ticket Management System': ['System Patch Deployment', 'Database Optimization', 'Server Rack Migration'],
  'Contract Management System': ['Vendor Agreement Renewal', 'NDA Processing - Alpha Corp', 'Compliance Audit Filing'],
  'Administration Division': ['Office Supply Restock', 'Executive Boardroom Prep', 'Guest Credentials Issuance'],
  'Strategic Marketing Division': ['Q3 Campaign Rollout', 'Press Release Distribution', 'Branding Asset Approval'],
  'Bank Services Division': ['Vault Access Log Review', 'ATM Cash Replenishment Request', 'Wire Transfer Authorization'],
  'Security Management': ['Biometric Scanner Calibration', 'Perimeter Breach Audit', 'CCTV Maintenance', 'Access Badge Revocation'],
  'Procurement Management': ['Hardware Bulk Purchase', 'Software License Acquisition', 'Tender Evaluation'],
  'User Management': ['RBAC Profile Update', 'New Hire Onboarding', 'Contractor Termination'],
  'Outsource Management': ['SLA Review - Cleaning Staff', 'External Security Vendor Invoice', 'IT Support Contract Escalation'],
  'Mail Management System': ['Diplomatic Pouch Transit Delay', 'Classified Document Shredding Request', 'Courier Dispatch'],
  'Audit Report': ['Quarterly Financial Audit', 'Compliance Inspection Route C', 'Risk Assessment Report Generation'],
  'Setup': ['Global Variable Configuration', 'API Key Rotation', 'System Initialization Checklist']
};

const STATUSES = ['SUBMITTED', 'LINE_MANAGER_APPROVED', 'HEAD_OFFICE_QUEUED', 'RESOLVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

async function generateSHA256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected.');

    console.log('Dropping existing collections...');
    await Department.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await AuditLedger.deleteMany({});
    console.log('✅ Dropped.');

    console.log('Seeding Departments...');
    const savedDepts = [];
    for (const d of DEPARTMENTS) {
      const dept = await Department.create({ deptCode: d.code, deptName: d.name, category: d.cat, region: d.region });
      savedDepts.push(dept);
    }

    console.log('Seeding Users...');
    const hqDept = savedDepts.find(d => d.region === 'HQ');
    
    const superAdmin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@govrms.local',
      hashedPassword: 'hash',
      role: 'SUPER_ADMIN',
      departmentId: hqDept._id,
      clearanceLevel: 5
    });

    const officers = [];
    for (let i=0; i<3; i++) {
      officers.push(await User.create({
        fullName: `Branch Officer ${i+1}`,
        email: `officer${i+1}@govrms.local`,
        hashedPassword: 'hash',
        role: 'BRANCH_OFFICER',
        departmentId: savedDepts[i % savedDepts.length]._id,
        clearanceLevel: 2
      }));
    }

    console.log('Seeding Tickets & Audit Ledgers...');
    let ticketCounter = 1;
    for (const dept of savedDepts) {
      const numTickets = Math.floor(Math.random() * 6) + 5; // 5 to 10 tickets per department
      const templates = TICKET_TEMPLATES[dept.category];

      for (let i=0; i<numTickets; i++) {
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
        const subCat = templates[Math.floor(Math.random() * templates.length)];
        
        const ticketNumber = `TKT-2026-${String(ticketCounter++).padStart(4, '0')}`;

        const ticket = await Ticket.create({
          ticketNumber,
          initiatorId: officers[0]._id,
          departmentId: dept._id,
          category: dept.category,
          subCategory: subCat,
          priority: priority,
          status: status,
          details: {
            justification: `Automated mock data generation for ${subCat} in ${dept.name}.`,
            fileSha256: await generateSHA256(Math.random().toString())
          }
        });

        // Generate Audit Ledger Chain
        let currentHash = 'GENESIS';
        
        // 1. Submission
        const subHash = await generateSHA256(currentHash + 'SUBMISSION');
        await AuditLedger.create({
          ticketId: ticket._id,
          action: 'SUBMISSION',
          actorId: officers[0]._id,
          previousState: 'NONE',
          newState: 'SUBMITTED',
          previousHash: currentHash,
          currentHash: subHash
        });
        currentHash = subHash;

        if (status !== 'SUBMITTED') {
          const endorseHash = await generateSHA256(currentHash + 'ENDORSEMENT');
          await AuditLedger.create({
            ticketId: ticket._id,
            action: 'ENDORSEMENT',
            actorId: superAdmin._id,
            previousState: 'SUBMITTED',
            newState: 'LINE_MANAGER_APPROVED',
            previousHash: currentHash,
            currentHash: endorseHash
          });
          currentHash = endorseHash;
        }

        if (status === 'RESOLVED') {
          const resHash = await generateSHA256(currentHash + 'FULFILLMENT');
          await AuditLedger.create({
            ticketId: ticket._id,
            action: 'FULFILLMENT',
            actorId: superAdmin._id,
            previousState: 'LINE_MANAGER_APPROVED',
            newState: 'RESOLVED',
            previousHash: currentHash,
            currentHash: resHash
          });
        }
      }
    }

    console.log(`✅ Seeding Complete. Generated ${ticketCounter - 1} tickets across ${savedDepts.length} departments.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
