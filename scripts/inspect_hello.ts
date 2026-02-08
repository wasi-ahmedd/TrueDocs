
import { db } from "../server/db";
import { users, people, cards } from "@shared/schema";
import { eq } from "drizzle-orm";
import fs from 'fs';
import path from 'path';

async function main() {
    const user = await db.query.users.findFirst({
        where: eq(users.username, "hello")
    });

    if (!user) {
        console.log("User 'hello' not found.");
        return;
    }

    console.log(`User found: ID ${user.id}, Username: ${user.username}`);

    const userPeople = await db.query.people.findMany({
        where: eq(people.userId, user.id),
        with: {
            cards: true
        }
    });

    console.log(`Found ${userPeople.length} people for user.`);

    for (const p of userPeople) {
        for (const c of p.cards) {
            const filePath = path.join(process.cwd(), 'pdfs', c.filename);
            console.log(`Checking card ${c.id}: ${c.originalName} (${c.filename})`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath).toString();
                try {
                    const json = JSON.parse(content);
                    if (json.iv && json.content && json.authTag) {
                        console.log(`  -> Status: ENCRYPTED (Modern format)`);
                    } else {
                        console.log(`  -> Status: JSON but NOT encrypted format?`);
                    }
                } catch (e) {
                    console.log(`  -> Status: PLAIN FILE (Legacy/Unencrypted) or Legacy Encrypted`);
                }
            } else {
                console.log(`  -> Status: MISSING FILE`);
            }
        }
    }
}

main().catch(console.error).finally(() => process.exit());
