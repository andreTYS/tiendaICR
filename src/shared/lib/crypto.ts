/**
 * AES-256-GCM helpers for symmetric secrets-at-rest (Victron API token, etc.).
 *
 * Key derivation: HKDF-SHA256 over AUTH_SECRET so adding a second secret to
 * the env is not required. If AUTH_SECRET is ever rotated, previously
 * encrypted ciphertext becomes unreadable — by design (it is a re-key event,
 * not a silent failure).
 *
 * Output format is three independent hex strings (cipher, iv, authTag) so
 * each lives in its own DB column and stays human-inspectable.
 */
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm" as const;
const IV_BYTES = 12; // GCM standard nonce size
const KEY_BYTES = 32;
const HKDF_INFO = "icr.victron.token.v1";
const HKDF_SALT = "icr.victron.salt.v1";

function getDerivedKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set (≥32 chars) before encrypting/decrypting secrets.",
    );
  }
  const okm = hkdfSync(
    "sha256",
    Buffer.from(secret, "utf8"),
    Buffer.from(HKDF_SALT, "utf8"),
    Buffer.from(HKDF_INFO, "utf8"),
    KEY_BYTES,
  );
  return Buffer.from(okm);
}

export interface EncryptedRecord {
  ciphertext: string; // hex
  iv: string;         // hex
  authTag: string;    // hex
}

export function encryptSecret(plaintext: string): EncryptedRecord {
  const key = getDerivedKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

export function decryptSecret(record: EncryptedRecord): string {
  if (!record.ciphertext || !record.iv || !record.authTag) {
    throw new Error("Incomplete encrypted record — cannot decrypt.");
  }
  const key = getDerivedKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(record.iv, "hex"));
  decipher.setAuthTag(Buffer.from(record.authTag, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, "hex")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/** Last 4 chars of the plaintext — used in the admin UI to confirm the token
 *  is set without exposing it. */
export function maskTokenTail(plaintext: string): string {
  if (plaintext.length <= 4) return "••••";
  return "•".repeat(8) + plaintext.slice(-4);
}
