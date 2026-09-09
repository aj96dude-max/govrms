const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  deptCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  deptName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  parentHeadOfficeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  }
}, { timestamps: true });

// Indexing for faster lookups
departmentSchema.index({ region: 1, category: 1 });

module.exports = mongoose.model('Department', departmentSchema);
