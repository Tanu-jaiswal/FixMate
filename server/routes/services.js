const express = require("express");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const { requireAuth, allowRoles } = require("../middleware/auth");
const httpError = require("../utils/httpError");

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/", async (req, res) => {
  for (const field of ["category", "location"]) {
    if (typeof req.query[field] === "string" && req.query[field].length > 100) {
      throw httpError(400, `${field} must be 100 characters or fewer.`);
    }
  }
  const filter = { isActive: true };
  if (typeof req.query.category === "string" && req.query.category.trim()) {
    filter.category = new RegExp(escapeRegex(req.query.category.trim()), "i");
  }
  if (typeof req.query.location === "string" && req.query.location.trim()) {
    filter.city = new RegExp(escapeRegex(req.query.location.trim()), "i");
  }

  const services = await Service.find(filter)
    .populate({
      path: "provider",
      match: { isActive: true },
      populate: { path: "user", select: "name" },
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ services: services.filter((service) => service.provider) });
});

router.get("/:id", async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, isActive: true })
    .populate({
      path: "provider",
      match: { isActive: true },
      populate: { path: "user", select: "name" },
    })
    .lean();
  if (!service || !service.provider) {
    throw httpError(404, "Service was not found.");
  }
  res.json({ service });
});

router.post("/", requireAuth, allowRoles("provider"), async (req, res) => {
  const { name, category, description, price, city } = req.body;
  if (typeof name !== "string" || !name.trim() || typeof category !== "string" ||
    !category.trim() || typeof description !== "string" || !description.trim() ||
    typeof city !== "string" || !city.trim()) {
    throw httpError(400, "Name, category, description, and city are required.");
  }
  const numericPrice = typeof price === "number" || (typeof price === "string" && price.trim())
    ? Number(price)
    : Number.NaN;
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    throw httpError(400, "Price must be a valid non-negative number.");
  }

  const provider = await Provider.findOne({ user: req.user._id, isActive: true });
  if (!provider) {
    throw httpError(403, "Activate your provider profile before listing a service.");
  }

  const service = await Service.create({
    provider: provider._id,
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: numericPrice,
    city: city.trim(),
  });
  res.status(201).json({ service });
});

router.patch("/:id", requireAuth, allowRoles("provider"), async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    throw httpError(404, "Provider profile was not found.");
  }

  const updates = {};
  for (const field of ["name", "category", "description", "price", "city", "isActive"]) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }
  if (updates.isActive !== undefined && typeof updates.isActive !== "boolean") {
    throw httpError(400, "Service availability must be true or false.");
  }
  for (const field of ["name", "category", "description", "city"]) {
    if (updates[field] !== undefined &&
      (typeof updates[field] !== "string" || !updates[field].trim())) {
      throw httpError(400, `${field} must be a non-empty string.`);
    }
    if (typeof updates[field] === "string") {
      updates[field] = updates[field].trim();
    }
  }
  if (Object.keys(updates).length === 0) {
    throw httpError(400, "Provide at least one service field to update.");
  }
  if (updates.price !== undefined) {
    updates.price = typeof updates.price === "number" ||
      (typeof updates.price === "string" && updates.price.trim())
      ? Number(updates.price)
      : Number.NaN;
    if (!Number.isFinite(updates.price) || updates.price < 0) {
      throw httpError(400, "Price must be a valid non-negative number.");
    }
  }

  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, provider: provider._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!service) {
    throw httpError(404, "Service was not found.");
  }
  res.json({ service });
});

router.delete("/:id", requireAuth, allowRoles("provider"), async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    throw httpError(404, "Provider profile was not found.");
  }
  const service = await Service.findOne({ _id: req.params.id, provider: provider._id });
  if (!service) {
    throw httpError(404, "Service was not found.");
  }
  if (await Booking.exists({ service: service._id, status: { $in: ["pending", "accepted", "in_progress"] } })) {
    throw httpError(409, "This service has active bookings and cannot be removed.");
  }
  service.isActive = false;
  await service.save();
  res.json({ message: "Service listing removed." });
});

module.exports = router;
