const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['SUBMITTED', 'LINE_MANAGER_APPROVED', 'HEAD_OFFICE_QUEUED', 'RESOLVED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  attachments: [{
    uri: { type: String, required: true },
    fileSha256: { type: String, required: true }
  }]
}, { timestamps: true });

ticketSchema.index({ initiatorId: 1 });
ticketSchema.index({ departmentId: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
