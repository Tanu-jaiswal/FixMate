const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Provider = require("../models/Provider");
const { COOKIE_NAME, requireAuth } = require("../middleware/auth");
const httpError = require("../utils/httpError");
const getSessionCookieOptions = require("../utils/sessionCookieOptions");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieOptions = getSessionCookieOptions();

function issueSession(user, res) {
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" }
  );
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
  };
}

router.post("/register", async (req, res) => {
  const { name, email, password, phone = "", role = "user", city, bio = "", experienceYears = 0, specialties = [] } = req.body;

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    throw httpError(400, "Enter a name between 2 and 100 characters.");
  }
  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    throw httpError(400, "Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw httpError(400, "Password must be between 8 and 128 characters.");
  }
  if (!["user", "provider"].includes(role)) {
    throw httpError(400, "Choose a valid account type.");
  }
  if (typeof phone !== "string" || phone.length > 30) {
    throw httpError(400, "Enter a valid phone number.");
  }

  let providerData;
  if (role === "provider") {
    if (typeof city !== "string" || !city.trim() || city.trim().length > 100) {
      throw httpError(400, "Enter your service city.");
    }
    if (!Array.isArray(specialties) || specialties.length === 0 || specialties.length > 20 ||
      specialties.some((specialty) => typeof specialty !== "string" || !specialty.trim() || specialty.length > 80)) {
      throw httpError(400, "Choose at least one valid service specialty.");
    }
    providerData = {
      city: city.trim(),
      bio: typeof bio === "string" ? bio.trim() : "",
      experienceYears: Number(experienceYears),
      specialties: [...new Set(specialties.map((specialty) => specialty.trim()))],
    };
    if (!Number.isFinite(providerData.experienceYears) || providerData.experienceYears < 0 || providerData.experienceYears > 80) {
      throw httpError(400, "Experience must be a number from 0 to 80.");
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    throw httpError(409, "An account with that email already exists.");
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone.trim(),
    role,
  });

  if (providerData) {
    try {
      await Provider.create({ user: user._id, ...providerData });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  issueSession(user, res);
  res.status(201).json({ user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || !emailPattern.test(email.trim()) ||
    typeof password !== "string" || !password) {
    throw httpError(400, "Enter a valid email address and password.");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, "Email or password is incorrect.");
  }

  issueSession(user, res);
  res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "You have been signed out." });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch("/me", requireAuth, async (req, res) => {
  const updates = {};
  for (const field of ["name", "phone", "address"]) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }
  if (Object.keys(updates).length === 0) {
    throw httpError(400, "Provide at least one profile field to update.");
  }
  if (updates.name !== undefined &&
    (typeof updates.name !== "string" || updates.name.trim().length < 2 || updates.name.trim().length > 100)) {
    throw httpError(400, "Enter a name between 2 and 100 characters.");
  }
  if (updates.phone !== undefined &&
    (typeof updates.phone !== "string" || updates.phone.length > 30)) {
    throw httpError(400, "Enter a valid phone number.");
  }
  if (updates.address !== undefined &&
    (typeof updates.address !== "string" || updates.address.length > 500)) {
    throw httpError(400, "Enter an address shorter than 500 characters.");
  }

  for (const field of Object.keys(updates)) {
    if (typeof updates[field] === "string") {
      updates[field] = updates[field].trim();
    }
  }
  Object.assign(req.user, updates);
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
