import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const updateAdmin = async () => {
  try {
    await connectDB();

    const currentEmail = "admin@example.com";

    const newName = "PRIYANSH VERMA";
    const newEmail = "priyanshverma600@gmail.com";
    const newMobile = "9628188450";

    // Apna desired password yahan rakho
    const newPassword = "Priyansh9@";

    const admin = await Admin.findOne({
      email: currentEmail,
    });

    if (!admin) {
      console.log("Admin not found.");
      return;
    }

    // Check whether new email belongs to another admin
    const emailAlreadyExists = await Admin.findOne({
      email: newEmail,
      _id: { $ne: admin._id },
    });

    if (emailAlreadyExists) {
      console.log("This email is already used by another admin.");
      return;
    }

    admin.name = newName;
    admin.email = newEmail;
    admin.mobileNumber = newMobile;
    admin.password = await bcrypt.hash(newPassword, 12);

    await admin.save();

    console.log("================================");
    console.log("Admin updated successfully.");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Mobile:", admin.mobileNumber);
    console.log("================================");
  } catch (error) {
    console.error("Admin update failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

updateAdmin();