const crypto = require("node:crypto");
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Provider = require("../models/Provider");
const Service = require("../models/Service");

const seedEmail = "fixmate-sample-provider@seed.invalid";
const city = "Meerut";
const samples = [
  {
    key: "electrician",
    name: "Electrician",
    category: "Electrician",
    description: "Local help with wiring, switches, fans, and common electrical repairs.",
    price: 350,
  },
  {
    key: "plumber",
    name: "Plumber",
    category: "Plumber",
    description: "Repairs for leaking taps, pipes, drains, and bathroom fittings.",
    price: 300,
  },
  {
    key: "ac-repair",
    name: "AC Repair",
    category: "AC Repair",
    description: "Air-conditioner inspection, routine servicing, and repair visits.",
    price: 500,
  },
  {
    key: "cleaning",
    name: "Home Cleaning",
    category: "Cleaning",
    description: "Scheduled home cleaning for kitchens, bathrooms, and living spaces.",
    price: 700,
  },
  {
    key: "carpenter",
    name: "Carpenter",
    category: "Carpenter",
    description: "Furniture assembly and repairs for doors, shelves, and woodwork.",
    price: 400,
  },
].map((sample) => ({
  ...sample,
  seedKey: `fixmate-sample-v1-${sample.key}`,
}));

async function findOrCreateSeedUser() {
  let user = await User.findOne({ email: seedEmail });
  if (user) {
    if (user.role !== "provider") {
      throw new Error("The reserved sample provider email belongs to a non-provider account.");
    }
    return user;
  }

  try {
    return await User.create({
      name: "FixMate Local Services",
      email: seedEmail,
      password: crypto.randomBytes(48).toString("base64url"),
      role: "provider",
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    user = await User.findOne({ email: seedEmail });
    if (!user || user.role !== "provider") {
      throw new Error("Could not safely create the sample provider account.");
    }
    return user;
  }
}

async function findOrCreateSeedProvider(user) {
  let provider = await Provider.findOne({ user: user._id });
  if (provider) return provider;

  const providerData = {
    user: user._id,
    bio: "Sample local service listings for FixMate.",
    city,
    experienceYears: 5,
    specialties: ["Electrician", "Plumber", "AC Repair", "Cleaning", "Carpenter"],
    isActive: true,
  };

  try {
    return await Provider.create(providerData);
  } catch (error) {
    if (error.code !== 11000) throw error;
    provider = await Provider.findOne({ user: user._id });
    if (!provider) {
      throw new Error("Could not safely create the sample provider profile.");
    }
    return provider;
  }
}

async function seedServices() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured before seeding services.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  await Service.init();

  const existingCount = await Service.countDocuments({});
  const seedKeys = samples.map((sample) => sample.seedKey);
  const existingSampleCount = await Service.countDocuments({ seedKey: { $in: seedKeys } });

  if (existingCount > 0 && existingCount !== existingSampleCount) {
    console.log("Service records already exist; no sample services were added.");
    return;
  }

  const user = await findOrCreateSeedUser();
  const provider = await findOrCreateSeedProvider(user);

  for (const sample of samples) {
    const { seedKey, name, category, description, price } = sample;
    await Service.updateOne(
      { seedKey },
      {
        $setOnInsert: {
          seedKey,
          provider: provider._id,
          name,
          category,
          description,
          price,
          city,
          isActive: true,
        },
      },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`Sample services are available (${samples.length} listings in ${city}).`);
}

if (require.main === module) {
  seedServices()
    .catch((error) => {
      console.error("Service seeding failed:", error.name);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = { samples, seedServices };
