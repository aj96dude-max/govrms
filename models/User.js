const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  hashedPassword: {
    type: String,
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['BRANCH_OFFICER', 'LINE_MANAGER', 'REGIONAL_DIRECTOR', 'SUPER_ADMIN']
  },
  clearanceLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  assignedRegion: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, { timestamps: true });

userSchema.index({ departmentId: 1 });

module.exports = mongoose.model('User', userSchema);
