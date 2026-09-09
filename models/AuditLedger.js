const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLedgerSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['SUBMISSION', 'ENDORSEMENT', 'ESCALATION', 'FULFILLMENT', 'REJECTION']
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousState: {
    type: String,
    required: true
  },
  newState: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  previousHash: {
    type: String,
    required: true,
    default: 'GENESIS'
  },
  currentHash: {
    type: String
  }
});

// Pre-save hook for currentHash calculation
auditLedgerSchema.pre('save', async function () {
  if (this.isNew) {
    const dataString = `${this.ticketId.toString()}${this.actorId.toString()}${this.newState}${this.previousHash}${this.timestamp.toISOString()}`;
    this.currentHash = crypto.createHash('sha256').update(dataString).digest('hex');
  }
});

// Prevent updating an existing ledger entry (append-only)
auditLedgerSchema.pre('findOneAndUpdate', async function () {
  throw new Error('AuditLedger documents cannot be updated.');
});
auditLedgerSchema.pre('updateOne', async function () {
  throw new Error('AuditLedger documents cannot be updated.');
});
auditLedgerSchema.pre('updateMany', async function () {
  throw new Error('AuditLedger documents cannot be updated.');
});

// Create index for traversing the hash chain
auditLedgerSchema.index({ ticketId: 1, timestamp: 1 });

module.exports = mongoose.model('AuditLedger', auditLedgerSchema);
