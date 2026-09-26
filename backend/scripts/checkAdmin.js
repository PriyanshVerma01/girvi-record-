import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const admin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL,
    }).select("+password");

    if (!admin) {
      console.log("❌ Admin not found");
      process.exit(0);
    }

    console.log("\n✅ Admin found\n");

    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Mobile:", admin.mobileNumber);
    console.log("Active:", admin.isActive);
    console.log(
      "Password hash exists:",
      Boolean(admin.password)
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkAdmin();