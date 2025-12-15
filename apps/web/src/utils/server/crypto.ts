import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM

const getKey = () => {
  const key = process.env.NEXT_PUBLIC_COOKIE_KEY;
  if (!key || Buffer.byteLength(key) !== 32) {
    throw new Error("SECRET_KEY must be 32 bytes");
  }
  return Buffer.from(key);
};

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted data
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(cipherText: string): string {
  const data = Buffer.from(cipherText, "base64");

  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

