import { storage } from './server/storage';
import bcrypt from 'bcryptjs';

async function reset() {
    try {
        console.log("Resetting password...");
        const hash = await bcrypt.hash("choudhary", 10);
        await storage.createSetting('password_hash', hash);
        console.log("Password successfully reset to 'choudhary'");
    } catch (error) {
        console.error("Failed to reset password:", error);
    }
    process.exit(0);
}

reset();
