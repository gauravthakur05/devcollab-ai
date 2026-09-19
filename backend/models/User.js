const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ALL_ROLES, ROLES } = require('../config/roles');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 100 },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ALL_ROLES, default: ROLES.DEVELOPER },
    avatarColor: { type: String, default: '#6E56CF' }, // used for generated avatar initials
    title: { type: String, default: 'Developer', maxlength: 60 },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    fullName: this.fullName,
    username: this.username,
    email: this.email,
    role: this.role,
    avatarColor: this.avatarColor,
    title: this.title,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
