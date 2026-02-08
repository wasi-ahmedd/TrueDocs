
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function setAdmin(username: string) {
    console.log(`Setting admin privileges for user: ${username}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.username, username),
    });

    if (!user) {
        console.error(`User '${username}' not found.`);
        process.exit(1);
    }

    await db.update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, user.id));

    console.log(`Success! User '${username}' is now an admin.`);
    process.exit(0);
}

const targetUsername = process.argv[2];

if (!targetUsername) {
    console.error("Usage: npm run set-admin <username>");
    process.exit(1);
}

setAdmin(targetUsername).catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
