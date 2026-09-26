import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization header check
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    // Token verify
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Admin database se find karo
    const admin = await Admin.findById(decoded.id).select(
      "-password"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // Account disabled
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled.",
      });
    }

    // Request ke andar admin attach karo
    req.admin = admin;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default protect;