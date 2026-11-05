const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 80,
      default: 0,
    },
    specialties: {
      type: [String],
      validate: {
        validator: (specialties) => specialties.length > 0,
        message: "Add at least one service specialty.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

providerSchema.index({ city: 1, specialties: 1 });

module.exports = mongoose.model("Provider", providerSchema);
