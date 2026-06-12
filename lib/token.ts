/**
 * Stateless config tokens: JSON -> deflateRaw -> AES-256-GCM -> base64url(iv|ct|tag).
 * The token is the only state in the app; it is opaque without ENCRYPTION_KEY.
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import type { BlendConfig } from "./config";

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/** Read and validate the 32-byte key from ENCRYPTION_KEY (hex or base64). */
export function getKeyFromEnv(env: NodeJS.ProcessEnv = process.env): Buffer {
  const raw = env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with `openssl rand -hex 32` " +
        "and set it in the environment (.env.local for dev, Vercel env for prod)."
    );
  }
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw.trim())) {
    key = Buffer.from(raw.trim(), "hex");
  } else {
    key = Buffer.from(raw.trim(), "base64");
  }
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must decode to exactly 32 bytes (64 hex chars or 44 base64 chars)."
    );
  }
  return key;
}

/** Encrypt a config object into an opaque URL-safe token. */
export function encryptConfig(config: BlendConfig, key: Buffer): string {
  const plain = deflateRawSync(Buffer.from(JSON.stringify(config), "utf8"));
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, tag]).toString("base64url");
}

/** Decrypt a token back into a config. Throws on any tamper/format error. */
export function decryptToken(token: string, key: Buffer): BlendConfig {
  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error("Invalid token encoding");
  }
  const buf = Buffer.from(token, "base64url");
  if (buf.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Token too short");
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH, buf.length - TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(inflateRawSync(plain).toString("utf8")) as BlendConfig;
}
