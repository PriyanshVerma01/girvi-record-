import crypto from "crypto";

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

export { generateOTP, hashOTP };