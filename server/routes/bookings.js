const express = require("express");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const Service = require("../models/Service");
const { requireAuth, allowRoles } = require("../middleware/auth");
const { canCustomerCancel, canProviderSetStatus } = require("../utils/bookingTransitions");
const httpError = require("../utils/httpError");

const router = express.Router();
const bookingPopulation = [
  { path: "customer", select: "name phone email" },
  { path: "service", select: "name category description price city" },
  { path: "provider", populate: { path: "user", select: "name phone" } },
];

router.use(requireAuth);

router.post("/", allowRoles("user"), async (req, res) => {
  const { serviceId, scheduledAt, address, details } = req.body;
  if (typeof serviceId !== "string" || typeof scheduledAt !== "string" ||
    typeof address !== "string" || address.trim().length < 8 ||
    typeof details !== "string" || details.trim().length < 3) {
    throw httpError(400, "Choose a service, date and time, address, and describe the requested work.");
  }

  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    throw httpError(400, "Choose a valid future date and time.");
  }
  const service = await Service.findOne({ _id: serviceId, isActive: true });
  if (!service) {
    throw httpError(404, "This service is no longer available.");
  }
  const provider = await Provider.findOne({ _id: service.provider, isActive: true });
  if (!provider) {
    throw httpError(404, "This provider is no longer available.");
  }

  const booking = await Booking.create({
    customer: req.user._id,
    provider: provider._id,
    service: service._id,
    scheduledAt: scheduledDate,
    address: address.trim(),
    details: details.trim(),
  });
  await booking.populate(bookingPopulation);
  res.status(201).json({ booking });
});

router.get("/mine", allowRoles("user"), async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .populate(bookingPopulation)
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

router.get("/provider", allowRoles("provider"), async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    throw httpError(404, "Provider profile was not found.");
  }
  const bookings = await Booking.find({ provider: provider._id })
    .populate(bookingPopulation)
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

router.patch("/:id/cancel", allowRoles("user"), async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) {
    throw httpError(404, "Booking was not found.");
  }
  if (!canCustomerCancel(booking.status)) {
    throw httpError(409, "This booking can no longer be cancelled.");
  }
  const cancelledBooking = await Booking.findOneAndUpdate(
    { _id: booking._id, customer: req.user._id, status: booking.status },
    { $set: { status: "cancelled" } },
    { new: true, runValidators: true }
  );
  if (!cancelledBooking) {
    throw httpError(409, "The booking status changed. Refresh and try again.");
  }
  await cancelledBooking.populate(bookingPopulation);
  res.json({ booking: cancelledBooking });
});

router.patch("/:id/status", allowRoles("provider"), async (req, res) => {
  const { status } = req.body;
  if (typeof status !== "string") {
    throw httpError(400, "Choose a booking status.");
  }
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    throw httpError(404, "Provider profile was not found.");
  }
  const booking = await Booking.findOne({ _id: req.params.id, provider: provider._id });
  if (!booking) {
    throw httpError(404, "Booking was not found.");
  }
  if (!canProviderSetStatus(booking.status, status)) {
    throw httpError(409, `A booking cannot move from ${booking.status} to ${status}.`);
  }
  const updatedBooking = await Booking.findOneAndUpdate(
    { _id: booking._id, provider: provider._id, status: booking.status },
    { $set: { status } },
    { new: true, runValidators: true }
  );
  if (!updatedBooking) {
    throw httpError(409, "The booking status changed. Refresh and try again.");
  }
  await updatedBooking.populate(bookingPopulation);
  res.json({ booking: updatedBooking });
});

module.exports = router;
