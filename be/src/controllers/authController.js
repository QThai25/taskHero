const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerifyEmail = require("../utils/sendVerifyEmail");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authController = {
  // =========================
  // GOOGLE LOGIN
  // =========================
  async googleLogin(req, res) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({
          success: false,
          message: "Google ID token is required",
        });
      }

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      let user = await User.findOne({ email });

      // ===== EXISTING USER =====
      if (user) {
        if (!user.googleId) user.googleId = googleId;
        if (!user.providers.includes("google")) user.providers.push("google");
        if (!user.picture) user.picture = picture;

        user.isEmailVerified = true;
        await user.save();
      }

      // ===== NEW USER =====
      if (!user) {
        user = await User.create({
          email,
          googleId,
          name,
          picture,
          providers: ["google"],
          isEmailVerified: true,
          hasPassword: false, // ⭐ QUAN TRỌNG
        });
      }

      // ⭐ FIX DỨT ĐIỂM
      const needsSetPassword =
        user.providers.includes("google") && !user.hasPassword;

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const isProd = process.env.NODE_ENV === "production";
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          providers: user.providers,
          needsSetPassword,
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }
  },

  // =========================
  // GET CURRENT USER
  // =========================
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const needsSetPassword =
        user.providers.includes("google") && !user.hasPassword;

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          providers: user.providers,
          needsSetPassword,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user profile",
      });
    }
  },

  // =========================
  // LOGOUT
  // =========================
  async logout(req, res) {
    try {
      const isProd = process.env.NODE_ENV === "production";

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Error during logout",
      });
    }
  },

  // =========================
  // REGISTER (LOCAL)
  // =========================
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        if (existingUser.providers.includes("google")) {
          return res.status(400).json({
            message:
              "Email already registered with Google. Please login with Google.",
          });
        }

        if (existingUser.providers.includes("local")) {
          return res.status(400).json({
            message: "Email already exists",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verifyToken = crypto.randomBytes(32).toString("hex");

      await User.create({
        email,
        password: hashedPassword,
        hasPassword: true, // ⭐
        name,
        providers: ["local"],
        isEmailVerified: false,
        emailVerifyToken: verifyToken,
        emailVerifyTokenExpires: Date.now() + 1000 * 60 * 60,
      });

      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
      await sendVerifyEmail(email, verifyUrl);

      res.json({
        success: true,
        message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        message: "Register failed",
      });
    }
  },

  // =========================
  // LOGIN (LOCAL)
  // =========================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user || !user.providers.includes("local")) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          code: "EMAIL_NOT_VERIFIED",
          message: "Email chưa được xác thực",
          email: user.email,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          providers: user.providers,
          token: token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Login failed",
      });
    }
  },

  // =========================
  // SET PASSWORD (GOOGLE → LOCAL)
  // =========================
  async setPassword(req, res) {
    try {
      const { password } = req.body;
      const userId = req.userId;

      if (!password || password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      const user = await User.findById(userId).select("+password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!user.providers.includes("google")) {
        return res.status(400).json({
          message: "Only Google accounts can set password",
        });
      }

      if (user.hasPassword) {
        return res.status(400).json({
          message: "Password already set",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.hasPassword = true; // ⭐ QUAN TRỌNG

      if (!user.providers.includes("local")) {
        user.providers.push("local");
      }

      await user.save();

      res.json({
        success: true,
        message: "Password set successfully",
      });
    } catch (error) {
      console.error("Set password error:", error);
      res.status(500).json({
        message: "Failed to set password",
      });
    }
  },

  // =========================
  // VERIFY EMAIL
  // =========================
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          message: "Missing token",
        });
      }

      const user = await User.findOne({
        emailVerifyToken: token,
        emailVerifyTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message: "Token invalid or expired",
        });
      }

      user.isEmailVerified = true;
      user.emailVerifyToken = undefined;
      user.emailVerifyTokenExpires = undefined;

      await user.save();

      res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({
        message: "Verify email failed",
      });
    }
  },
  // =========================
  // CHANGE PASSWORD
  // =========================
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Missing password fields",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "Password too short",
        });
      }

      const user = await User.findById(req.userId).select("+password");

      if (!user || !user.hasPassword) {
        return res.status(400).json({
          message: "Account has no password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Current password incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (err) {
      console.error("changePassword error:", err);
      res.status(500).json({
        message: "Change password failed",
      });
    }
  },
  //  =========================
  // RESEND VERIFY EMAIL
  //  =========================
  async resendVerifyEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          message: "Email already verified",
        });
      }

      const verifyToken = crypto.randomBytes(32).toString("hex");

      user.emailVerifyToken = verifyToken;
      user.emailVerifyTokenExpires = Date.now() + 1000 * 60 * 60;

      await user.save();

      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

      await sendVerifyEmail(user.email, verifyUrl);

      res.json({
        success: true,
        message: "Verification email resent",
      });
    } catch (error) {
      console.error("Resend verify error:", error);
      res.status(500).json({
        message: "Resend verify failed",
      });
    }
  },
  //  =========================
  // FORGOT PASSWORD
  //  =========================
  async forgotPassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.hasPassword) {
      return res.json({ success: true }); // không leak email
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendVerifyEmail(email, url);

    res.json({ success: true });
  },
  //  =========================
  // RESET PASSWORD
  //  =========================
  async resetPassword(req, res) {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.hasPassword = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    if (!user.providers.includes("local")) {
      user.providers.push("local");
    }

    await user.save();

    res.json({ success: true });
  },
};

module.exports = authController;
