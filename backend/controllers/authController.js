import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateSecret,
  generateURI,
  verify,
} from "otplib";
import QRCode from "qrcode";

import Admin from "../models/Admin.js";
import {
  generateOTP,
  hashOTP,
} from "../utils/sendOTP.js";
import {
  encrypt,
  decrypt,
} from "../utils/encryption.js";


// =====================================================
// Helper: Create JWT token
// =====================================================

const createAuthToken = (adminId) => {
  return jwt.sign(
    {
      id: adminId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};


// =====================================================
// Helper: Return safe admin data
// =====================================================

const getSafeAdminData = (admin) => {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    mobileNumber: admin.mobileNumber,
    totpEnabled: admin.totpEnabled,
  };
};


// =====================================================
// Get Admin Profile
// =====================================================

const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    return res.status(200).json({
      success: true,
      admin: getSafeAdminData(admin),
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
};


// =====================================================
// Create Authenticator Setup
// =====================================================

const createAuthenticatorSetup = async (admin) => {
  const secret = generateSecret();

  const encryptedSecret = encrypt(secret);

  admin.totpSecretEncrypted = encryptedSecret;
  admin.totpSetupExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await admin.save();

  const otpauthUrl = generateURI({
    issuer: "Girvi Record Portal",
    label: admin.email,
    secret,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(
    otpauthUrl
  );

  return {
    qrCodeDataUrl,
    secret,
  };
};


// =====================================================
// Login: Email + Password
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select(
      "+password +loginAttempts +lockUntil +totpSecretEncrypted"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled.",
      });
    }

    if (
      admin.lockUntil &&
      admin.lockUntil > new Date()
    ) {
      return res.status(423).json({
        success: false,
        message:
          "Account temporarily locked. Please try again later.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      admin.loginAttempts =
        (admin.loginAttempts || 0) + 1;

      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(
          Date.now() + 15 * 60 * 1000
        );
        admin.loginAttempts = 0;
      }

      await admin.save();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    // If Authenticator is not enabled, setup is required
    if (
      !admin.totpEnabled ||
      !admin.totpSecretEncrypted
    ) {
      const setup =
        await createAuthenticatorSetup(admin);

      return res.status(200).json({
        success: true,
        requiresAuthenticatorSetup: true,
        qrCodeDataUrl: setup.qrCodeDataUrl,
        secret: setup.secret,
        message:
          "Scan this QR code in Google Authenticator and verify the code.",
      });
    }

    return res.status(200).json({
      success: true,
      requiresOTP: true,
      requiresAuthenticator: true,
      message:
        "Enter the 6-digit code from Google Authenticator.",
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};


// =====================================================
// Verify Authenticator OTP During Login
// =====================================================

const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and Authenticator code are required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticator code must be 6 digits.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select(
      "+totpSecretEncrypted"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid login details.",
      });
    }

    if (
      !admin.totpEnabled ||
      !admin.totpSecretEncrypted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator is not enabled.",
      });
    }

    const secret = decrypt(
      admin.totpSecretEncrypted
    );

    const isValid = await verify({
      secret,
      token: String(otp),
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired Authenticator code.",
      });
    }

    const token = createAuthToken(
      admin._id.toString()
    );

    return res.status(200).json({
      success: true,
      token,
      admin: getSafeAdminData(admin),
      message: "Login successful.",
    });
  } catch (error) {
    console.error(
      "Verify login OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify Authenticator code.",
    });
  }
};


// =====================================================
// Verify Authenticator Setup
// =====================================================

const verifyAuthenticatorSetup = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and Authenticator code are required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticator code must be 6 digits.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select(
      "+totpSecretEncrypted +totpSetupExpiresAt"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (
      !admin.totpSecretEncrypted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticator setup was not started.",
      });
    }

    if (
      admin.totpSetupExpiresAt &&
      admin.totpSetupExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticator setup expired. Please login again.",
      });
    }

    const secret = decrypt(
      admin.totpSecretEncrypted
    );

    const isValid = await verify({
      secret,
      token: String(otp),
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Authenticator code.",
      });
    }

    admin.totpEnabled = true;
    admin.totpSetupExpiresAt = null;

    await admin.save();

    const token = createAuthToken(
      admin._id.toString()
    );

    return res.status(200).json({
      success: true,
      token,
      admin: getSafeAdminData(admin),
      message:
        "Google Authenticator enabled successfully.",
    });
  } catch (error) {
    console.error(
      "Authenticator setup verification error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify Authenticator setup.",
    });
  }
};


// =====================================================
// FORGOT PASSWORD - Start
// No OTP generated in terminal
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select(
      "+totpSecretEncrypted"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email.",
      });
    }

    if (
      !admin.totpEnabled ||
      !admin.totpSecretEncrypted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator is not enabled for this account.",
      });
    }

    return res.status(200).json({
      success: true,
      requiresAuthenticator: true,
      message:
        "Enter the current 6-digit code from your Google Authenticator app.",
    });
  } catch (error) {
    console.error(
      "Forgot password start error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start password reset.",
    });
  }
};


// =====================================================
// FORGOT PASSWORD - Verify Google Authenticator Code
// Returns short-lived reset token
// =====================================================

const verifyResetOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and Google Authenticator code are required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator code must be 6 digits.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select(
      "+totpSecretEncrypted"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin account not found.",
      });
    }

    if (
      !admin.totpEnabled ||
      !admin.totpSecretEncrypted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator is not enabled for this account.",
      });
    }

    const secret = decrypt(
      admin.totpSecretEncrypted
    );

    const isValid = await verify({
      secret,
      token: String(otp),
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired Google Authenticator code.",
      });
    }

    const resetToken = jwt.sign(
      {
        id: admin._id.toString(),
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      success: true,
      resetToken,
      message:
        "Authenticator code verified. You can now set a new password.",
    });
  } catch (error) {
    console.error(
      "Verify reset Authenticator code error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify Authenticator code.",
    });
  }
};


// =====================================================
// FORGOT PASSWORD - Reset Password
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
    } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and new password are required.",
      });
    }

    if (typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "New password must be a valid string.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset session expired. Please start again.",
      });
    }

    if (
      decoded.purpose !== "password-reset"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid password reset token.",
      });
    }

    const admin = await Admin.findById(
      decoded.id
    ).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin account not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    admin.password = hashedPassword;
    admin.loginAttempts = 0;
    admin.lockUntil = null;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login again.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password.",
    });
  }
};


// =====================================================
// Change Password - Logged In
// =====================================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    ).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    admin.password = await bcrypt.hash(
      newPassword,
      12
    );

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password.",
    });
  }
};


// =====================================================
// Change Name
// =====================================================

const changeName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    admin.name = name.trim();

    await admin.save();

    return res.status(200).json({
      success: true,
      admin: getSafeAdminData(admin),
      message:
        "Name updated successfully.",
    });
  } catch (error) {
    console.error(
      "Change name error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change name.",
    });
  }
};


// =====================================================
// Change Email - Start
// Uses current password + Authenticator
// =====================================================

const changeEmailStart = async (req, res) => {
  try {
    const {
      currentPassword,
      newEmail,
    } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new email are required.",
      });
    }

    const normalizedEmail = newEmail
      .trim()
      .toLowerCase();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "+password +totpSecretEncrypted +pendingEmail"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    if (
      !admin.totpEnabled ||
      !admin.totpSecretEncrypted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator must be enabled first.",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: {
        $ne: admin._id,
      },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "This email is already registered.",
      });
    }

    admin.pendingEmail = normalizedEmail;

    await admin.save();

    return res.status(200).json({
      success: true,
      requiresAuthenticator: true,
      message:
        "Password verified. Enter the current Google Authenticator code.",
    });
  } catch (error) {
    console.error(
      "Change email start error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start email change.",
    });
  }
};


// =====================================================
// Change Email - Verify Authenticator Code
// =====================================================

const verifyEmailChangeOTP = async (
  req,
  res
) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator code is required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticator code must be 6 digits.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "+totpSecretEncrypted +pendingEmail"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (
      !admin.pendingEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No pending email change found.",
      });
    }

    if (
      !admin.totpEnabled ||
      !admin.totpSecretEncrypted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google Authenticator is not enabled.",
      });
    }

    const secret = decrypt(
      admin.totpSecretEncrypted
    );

    const isValid = await verify({
      secret,
      token: String(otp),
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired Authenticator code.",
      });
    }

    const emailAlreadyExists =
      await Admin.findOne({
        email: admin.pendingEmail,
        _id: {
          $ne: admin._id,
        },
      });

    if (emailAlreadyExists) {
      admin.pendingEmail = undefined;
      await admin.save();

      return res.status(409).json({
        success: false,
        message:
          "This email is already registered.",
      });
    }

    admin.email = admin.pendingEmail;
    admin.pendingEmail = undefined;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Email changed successfully. Please login again with your new email.",
    });
  } catch (error) {
    console.error(
      "Verify email change error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify email change.",
    });
  }
};


// =====================================================
// Change Mobile - Start
// Existing terminal OTP flow
// =====================================================

const changeMobileStart = async (req, res) => {
  try {
    const {
      currentPassword,
      newMobileNumber,
    } = req.body;

    if (
      !currentPassword ||
      !newMobileNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new mobile number are required.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "+password +mobileChangeOtpHash +mobileChangeOtpExpiresAt +mobileChangeOtpAttempts +mobileChangePasswordVerified +pendingMobileNumber"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    const normalizedMobile =
      String(newMobileNumber)
        .replace(/\D/g, "");

    if (!/^\d{10}$/.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit mobile number.",
      });
    }

    const mobileAlreadyExists =
      await Admin.findOne({
        mobileNumber: normalizedMobile,
        _id: {
          $ne: admin._id,
        },
      });

    if (mobileAlreadyExists) {
      return res.status(409).json({
        success: false,
        message:
          "This mobile number is already registered.",
      });
    }

    const otp = generateOTP();

    admin.mobileChangeOtpHash = hashOTP(otp);
    admin.mobileChangeOtpExpiresAt =
      new Date(Date.now() + 10 * 60 * 1000);
    admin.mobileChangeOtpAttempts = 0;
    admin.mobileChangePasswordVerified = true;
    admin.pendingMobileNumber = normalizedMobile;

    await admin.save();

    console.log(
      `Mobile change OTP for ${admin.email}: ${otp}`
    );

    return res.status(200).json({
      success: true,
      message:
        "OTP generated. Check backend terminal.",
    });
  } catch (error) {
    console.error(
      "Change mobile start error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start mobile number change.",
    });
  }
};


// =====================================================
// Verify Current Mobile OTP
// =====================================================

const verifyCurrentMobileOTP = async (
  req,
  res
) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "+mobileChangeOtpHash +mobileChangeOtpExpiresAt +mobileChangeOtpAttempts +mobileChangePasswordVerified"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (
      !admin.mobileChangePasswordVerified
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please start mobile change again.",
      });
    }

    if (
      !admin.mobileChangeOtpExpiresAt ||
      admin.mobileChangeOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    if (
      admin.mobileChangeOtpAttempts >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many invalid OTP attempts.",
      });
    }

    const isValid =
      hashOTP(String(otp)) ===
      admin.mobileChangeOtpHash;

    if (!isValid) {
      admin.mobileChangeOtpAttempts += 1;
      await admin.save();

      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    admin.mobileChangeOtpHash = undefined;
    admin.mobileChangeOtpExpiresAt = undefined;
    admin.mobileChangeOtpAttempts = 0;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Current mobile verification successful.",
    });
  } catch (error) {
    console.error(
      "Verify current mobile OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify current mobile OTP.",
    });
  }
};


// =====================================================
// Send New Mobile OTP
// Existing terminal OTP flow
// =====================================================

const sendNewMobileOTP = async (
  req,
  res
) => {
  try {
    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "+pendingMobileNumber +newMobileOtpHash +newMobileOtpExpiresAt +newMobileOtpAttempts"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (!admin.pendingMobileNumber) {
      return res.status(400).json({
        success: false,
        message:
          "No pending mobile number found.",
      });
    }

    const otp = generateOTP();

    admin.newMobileOtpHash = hashOTP(otp);
    admin.newMobileOtpExpiresAt =
      new Date(Date.now() + 10 * 60 * 1000);
    admin.newMobileOtpAttempts = 0;

    await admin.save();

    console.log(
      `New mobile OTP for ${admin.email}: ${otp}`
    );

    return res.status(200).json({
      success: true,
      message:
        "New mobile OTP generated. Check backend terminal.",
    });
  } catch (error) {
    console.error(
      "Send new mobile OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send new mobile OTP.",
    });
  }
};


// =====================================================
// Verify New Mobile OTP
// =====================================================

const verifyNewMobileOTP = async (
  req,
  res
) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "+pendingMobileNumber +newMobileOtpHash +newMobileOtpExpiresAt +newMobileOtpAttempts"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (
      !admin.pendingMobileNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No pending mobile number found.",
      });
    }

    if (
      !admin.newMobileOtpExpiresAt ||
      admin.newMobileOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    if (
      admin.newMobileOtpAttempts >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many invalid OTP attempts.",
      });
    }

    const isValid =
      hashOTP(String(otp)) ===
      admin.newMobileOtpHash;

    if (!isValid) {
      admin.newMobileOtpAttempts += 1;
      await admin.save();

      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const mobileAlreadyExists =
      await Admin.findOne({
        mobileNumber: admin.pendingMobileNumber,
        _id: {
          $ne: admin._id,
        },
      });

    if (mobileAlreadyExists) {
      return res.status(409).json({
        success: false,
        message:
          "This mobile number is already registered.",
      });
    }

    admin.mobileNumber =
      admin.pendingMobileNumber;

    admin.pendingMobileNumber = undefined;
    admin.newMobileOtpHash = undefined;
    admin.newMobileOtpExpiresAt = undefined;
    admin.newMobileOtpAttempts = 0;
    admin.mobileChangePasswordVerified = false;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Mobile number changed successfully.",
    });
  } catch (error) {
    console.error(
      "Verify new mobile OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify new mobile OTP.",
    });
  }
};


// =====================================================
// Exports
// =====================================================

export {
  login,
  verifyOTP,
  verifyAuthenticatorSetup,

  forgotPassword,
  verifyResetOTP,
  resetPassword,

  getProfile,
  changePassword,
  changeName,

  changeEmailStart,
  verifyEmailChangeOTP,

  changeMobileStart,
  verifyCurrentMobileOTP,
  sendNewMobileOTP,
  verifyNewMobileOTP,
};