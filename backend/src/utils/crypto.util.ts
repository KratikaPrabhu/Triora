import crypto from 'crypto';
import env from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const ENC_PREFIX = 'enc:v1:';

/**
 * Derive a robust 256-bit (32-byte) key using SHA-256
 */
function getEncryptionKey(): Buffer {
  const secret = env.ENCRYPTION_KEY || env.JWT_SECRET || 'triora_default_secure_vault_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return text as any;
  if (text.startsWith(ENC_PREFIX)) return text; // Prevent duplicate encryption

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return `${ENC_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (err) {
    console.error('[Crypto] Encryption failed:', err);
    return text;
  }
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Gracefully returns original text if unencrypted for seamless backwards compatibility.
 */
export function decryptText(cipherText: string | null | undefined): string {
  if (!cipherText || typeof cipherText !== 'string') return cipherText as any;
  if (!cipherText.startsWith(ENC_PREFIX)) return cipherText; // Backwards compatible with existing unencrypted data

  try {
    const key = getEncryptionKey();
    const payload = cipherText.slice(ENC_PREFIX.length);
    const parts = payload.split(':');

    if (parts.length !== 3) {
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('[Crypto] Decryption failed, returning raw string:', err);
    return cipherText;
  }
}

