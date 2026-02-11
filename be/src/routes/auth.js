const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const UserBadge = require("../models/UserBadge");
// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);

// Protected routes
router.get("/me", auth, authController.getCurrentUser);
router.post("/logout", auth, authController.logout);
router.post("/set-password", auth, authController.setPassword);
router.post("/resend-verify-email", authController.resendVerifyEmail);
router.post("/verify-email", authController.verifyEmail);
router.post("/change-password", auth, authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
