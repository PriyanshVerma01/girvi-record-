import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC ADMIN INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ========================================
    // PASSWORD
    // ========================================

    password: {
      type: String,
      required: true,
      select: false,
    },

    // ========================================
    // OLD LOGIN OTP
    // ========================================
    // Currently not used for Authenticator OTP.
    // Kept so existing database structure
    // does not cause problems.

    otpHash: {
      type: String,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    otpUsed: {
      type: Boolean,
      default: false,
      select: false,
    },

    // ========================================
    // FREE AUTHENTICATOR APP 2FA
    // ========================================

    totpSecretEncrypted: {
      type: String,
      select: false,
    },

    totpEnabled: {
      type: Boolean,
      default: false,
    },

    totpSetupExpiresAt: {
      type: Date,
      select: false,
    },

    // ========================================
    // FORGOT PASSWORD OTP
    // ========================================

    resetOtpHash: {
      type: String,
      select: false,
    },

    resetOtpExpiresAt: {
      type: Date,
      select: false,
    },

    resetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    resetOtpVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    // ========================================
    // LOGIN SECURITY / LOCKOUT
    // ========================================

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },

    // ========================================
    // CHANGE MOBILE NUMBER
    // ========================================

    mobileChangeOtpHash: {
      type: String,
      select: false,
    },

    mobileChangeOtpExpiresAt: {
      type: Date,
      select: false,
    },

    mobileChangeOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    mobileChangePasswordVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    pendingMobileNumber: {
      type: String,
      select: false,
    },

    newMobileOtpHash: {
      type: String,
      select: false,
    },

    newMobileOtpExpiresAt: {
      type: Date,
      select: false,
    },

    newMobileOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // ========================================
    // CHANGE EMAIL
    // ========================================

    emailChangeOtpHash: {
      type: String,
      select: false,
    },

    emailChangeOtpExpiresAt: {
      type: Date,
      select: false,
    },

    emailChangeOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    pendingEmail: {
      type: String,
      select: false,
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

const Admin = mongoose.model(
  "Admin",
  adminSchema
);

export default Admin;