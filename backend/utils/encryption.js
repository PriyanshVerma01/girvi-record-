import crypto from "crypto";

const getEncryptionKey = () => {
  const key = process.env.TOTP_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "TOTP_ENCRYPTION_KEY is missing from .env"
    );
  }

  return crypto
    .createHash("sha256")
    .update(key)
    .digest();
};

const encrypt = (text) => {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  let encrypted = cipher.update(
    text,
    "utf8",
    "hex"
  );

  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted,
  ].join(":");
};

const decrypt = (encryptedText) => {
  const key = getEncryptionKey();

  const [
    ivHex,
    authTagHex,
    encryptedHex,
  ] = encryptedText.split(":");

  const iv = Buffer.from(
    ivHex,
    "hex"
  );

  const authTag = Buffer.from(
    authTagHex,
    "hex"
  );

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(
    encryptedHex,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};

export {
  encrypt,
  decrypt,
};