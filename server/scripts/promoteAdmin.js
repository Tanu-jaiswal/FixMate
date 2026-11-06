require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured before promoting an administrator.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to the email address of an existing FixMate account.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No existing FixMate account was found for ADMIN_EMAIL.");
  }
  user.role = "admin";
  await user.save();
  console.log("The existing account was granted administrator access.");
}

if (require.main === module) {
  promoteAdmin()
    .catch((error) => {
      console.error("Administrator setup failed:", error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = promoteAdmin;
