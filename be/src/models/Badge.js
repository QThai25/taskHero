const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },

    name: { type: String, required: true },
    description: { type: String },

    condition: {
      type: {
        type: String,
        enum: [
          "tasks",
          "streak",
          "onTime",
          "level",
          "dailyTasks",
          "rank",
          "projects",
        ],
        required: true,
      },
      value: { type: Number, required: true },
    },

    icon: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", BadgeSchema);
