import jwt from "jsonwebtoken";

const generateToken = (adminId) => {
  return jwt.sign(
    {
      id: adminId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export default generateToken;