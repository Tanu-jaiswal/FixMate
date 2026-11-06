const express = require("express");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const { requireAuth, allowRoles } = require("../middleware/auth");
const httpError = require("../utils/httpError");

const router = express.Router();

router.get("/", async (req, res) => {
  for (const field of ["location", "category"]) {
    if (typeof req.query[field] === "string" && req.query[field].length > 100) {
      throw httpError(400, `${field} must be 100 characters or fewer.`);
    }
  }
  const filter = { isActive: true };
  if (typeof req.query.location === "string" && req.query.location.trim()) {
    filter.city = new RegExp(req.query.location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  }
  if (typeof req.query.category === "string" && req.query.category.trim()) {
    filter.specialties = new RegExp(req.query.category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  }

  const providers = await Provider.find(filter)
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ providers });
});

router.get("/me", requireAuth, allowRoles("provider"), async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id }).lean();
  if (!provider) {
    throw httpError(404, "Provider profile was not found.");
  }
  res.json({ provider });
});

router.patch("/me", requireAuth, allowRoles("provider"), async (req, res) => {
  const allowedFields = ["bio", "city", "experienceYears", "specialties", "isActive"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );
  if (Object.keys(updates).length === 0) {
    throw httpError(400, "Provide at least one profile field to update.");
  }
  if (updates.isActive !== undefined && typeof updates.isActive !== "boolean") {
    throw httpError(400, "Profile availability must be true or false.");
  }
  if (updates.specialties !== undefined) {
    if (!Array.isArray(updates.specialties) || updates.specialties.length === 0 ||
      updates.specialties.length > 20 ||
      updates.specialties.some((value) =>
        typeof value !== "string" || !value.trim() || value.trim().length > 80
      )) {
      throw httpError(400, "Choose at least one service specialty.");
    }
    updates.specialties = [...new Set(updates.specialties.map((value) => value.trim()))];
  }
  if (updates.experienceYears !== undefined) {
    updates.experienceYears = Number(updates.experienceYears);
    if (!Number.isFinite(updates.experienceYears)) {
      throw httpError(400, "Experience must be a valid number.");
    }
  }

  const provider = await Provider.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!provider) {
    throw httpError(404, "Provider profile was not found.");
  }
  res.json({ provider });
});

router.get("/:id", async (req, res) => {
  const provider = await Provider.findOne({ _id: req.params.id, isActive: true })
    .populate("user", "name")
    .lean();
  if (!provider) {
    throw httpError(404, "Provider was not found.");
  }
  res.json({ provider });
});

module.exports = router;
