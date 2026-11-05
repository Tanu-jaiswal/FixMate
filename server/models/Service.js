const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
    },
    category: {
      type: String,
      trim: true,
      required: true,
      maxlength: 80,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    city: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seedKey: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, city: 1, isActive: 1 });
serviceSchema.index({ seedKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Service", serviceSchema);
