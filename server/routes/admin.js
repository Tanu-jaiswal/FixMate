const express = require("express");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const Service = require("../models/Service");
const User = require("../models/User");
const { requireAuth, allowRoles } = require("../middleware/auth");
const httpError = require("../utils/httpError");

const router = express.Router();
router.use(requireAuth, allowRoles("admin"));

router.get("/overview", async (req, res) => {
  const [customers, providers, activeServices, bookings, bookingStatuses] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "provider" }),
    Service.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    statistics: {
      customers,
      providers,
      activeServices,
      bookings,
      bookingStatuses: Object.fromEntries(bookingStatuses.map(({ _id, count }) => [_id, count])),
    },
  });
});

router.get("/users", async (req, res) => {
  const users = await User.find({ role: { $in: ["user", "provider"] } })
    .select("name email role createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ users });
});

router.get("/providers", async (req, res) => {
  const providers = await Provider.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ providers });
});

router.get("/services", async (req, res) => {
  const services = await Service.find()
    .populate({
      path: "provider",
      select: "city isActive",
      populate: { path: "user", select: "name email" },
    })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ services });
});

router.patch("/services/:id/status", async (req, res) => {
  if (typeof req.body.isActive !== "boolean") {
    throw httpError(400, "Service availability must be true or false.");
  }

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: req.body.isActive } },
    { new: true, runValidators: true }
  )
    .select("name category city isActive")
    .lean();
  if (!service) {
    throw httpError(404, "Service was not found.");
  }
  res.json({ service });
});

router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find()
    .populate({ path: "customer", select: "name email" })
    .populate({ path: "service", select: "name category" })
    .populate({
      path: "provider",
      populate: { path: "user", select: "name email" },
    })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ bookings });
});

module.exports = router;
