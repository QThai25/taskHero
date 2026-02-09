const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
      default: null,
    },

    name: {
      type: String,
      required: true,
    },

    picture: String,

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    providers: {
      type: [String],
      enum: ["local", "google"],
      default: [],
    },

    // ⭐ email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: String,
    emailVerifyTokenExpires: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
