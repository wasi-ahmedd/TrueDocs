import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Derive a 32-byte key from the password
// In a production app, use a unique salt per user/install stored in DB
const SALT = 'fixed_salt_for_simplicity_govt_cards';
const KEY_LENGTH = 32;

function getKey(password: string): Buffer {
    return crypto.scryptSync(password, SALT, KEY_LENGTH);
}

export function encrypt(buffer: Buffer, password: string) {
    const iv = crypto.randomBytes(16);
    const key = getKey(password);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

export function decrypt(encrypted: { iv: string, content: string, authTag: string }, password: string) {
    const key = getKey(password);
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted.content, 'hex')), decipher.final()]);
    return decrypted;
}
