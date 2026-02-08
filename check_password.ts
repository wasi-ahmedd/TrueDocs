import { storage } from './server/storage';
import bcrypt from 'bcryptjs';

async function check() {
    try {
        const hash = await storage.getSetting('password_hash');
        console.log("Hash found:", !!hash);
        if (!hash) {
            console.log("No hash found!");
            return;
        }
        const match = await bcrypt.compare("choudhary", hash);
        console.log("Does 'choudhary' match the stored hash?", match);
    } catch (error) {
        console.error("Check failed:", error);
    }
    process.exit(0);
}

check();
