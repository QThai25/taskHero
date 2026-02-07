const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  condition: { type: String }, // free-form condition string for reference
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model("Badge", BadgeSchema);
