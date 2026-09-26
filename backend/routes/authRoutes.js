import express from "express";

import {
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
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// =====================================================
// Login Routes
// =====================================================

router.post(
  "/login",
  login
);

router.post(
  "/verify-otp",
  verifyOTP
);

router.post(
  "/verify-authenticator-setup",
  verifyAuthenticatorSetup
);


// =====================================================
// Forgot Password Routes
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOTP
);

router.post(
  "/reset-password",
  resetPassword
);


// =====================================================
// Profile Route
// =====================================================

router.get(
  "/profile",
  protect,
  getProfile
);


// =====================================================
// Account Settings Routes
// =====================================================

router.post(
  "/change-password",
  protect,
  changePassword
);

router.post(
  "/change-name",
  protect,
  changeName
);


// =====================================================
// Change Email Routes
// =====================================================

router.post(
  "/change-email/start",
  protect,
  changeEmailStart
);

router.post(
  "/change-email/verify-otp",
  protect,
  verifyEmailChangeOTP
);


// =====================================================
// Change Mobile Routes
// =====================================================

router.post(
  "/change-mobile/start",
  protect,
  changeMobileStart
);

router.post(
  "/change-mobile/verify-current-otp",
  protect,
  verifyCurrentMobileOTP
);

router.post(
  "/change-mobile/send-new-otp",
  protect,
  sendNewMobileOTP
);

router.post(
  "/change-mobile/verify-new-otp",
  protect,
  verifyNewMobileOTP
);

export default router;