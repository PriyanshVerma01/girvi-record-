import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // MongoDB connect
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Check ADMIN_EMAIL
    if (!process.env.ADMIN_EMAIL) {
      console.log(
        "❌ ADMIN_EMAIL is not configured in .env"
      );

      await mongoose.disconnect();
      process.exit(1);
    }

    const email =
      process.env.ADMIN_EMAIL
        .toLowerCase()
        .trim();

    // Check existing admin
    const existingAdmin =
      await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(
        "❌ Admin already exists"
      );

      console.log(
        "Email:",
        existingAdmin.email
      );

      await mongoose.disconnect();
      process.exit(0);
    }

    // Temporary admin password
    const password = "Admin@12345";

    // Temporary admin mobile
    const mobileNumber = "9999999999";

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // Create admin
    const admin = await Admin.create({
      name: "Priyansh Verma",

      email: email,

      mobileNumber: mobileNumber,

      password: hashedPassword,

      isActive: true,
    });

    console.log(
      "\n================================"
    );

    console.log(
      "✅ Admin created successfully"
    );

    console.log(
      "================================"
    );

    console.log(
      "Name:",
      admin.name
    );

    console.log(
      "Email:",
      admin.email
    );

    console.log(
      "Password:",
      password
    );

    console.log(
      "Mobile:",
      admin.mobileNumber
    );

    console.log(
      "================================\n"
    );

    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Error creating admin:"
    );

    console.error(
      error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

createAdmin();