import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await connectDB();

    const email = "priyanshverma600@gmail.com";

    // Apna desired password yahan rakho
    const newPassword = "Priyansh1@";

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("Admin not found.");
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    admin.password = hashedPassword;

    await admin.save();

    console.log("Admin password reset successfully.");
    console.log("Email:", email);
  } catch (error) {
    console.error("Password reset failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

resetAdminPassword();