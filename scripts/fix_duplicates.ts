
import { db } from "../server/db";
import { customCardTypes } from "../shared/schema";
import { sql, eq } from "drizzle-orm";

async function fixDuplicates() {
    console.log("Starting comprehensive card type cleanup...");

    const allTypes = await db.select().from(customCardTypes);
    console.log(`Fetched ${allTypes.length} total card types.`);

    // Separate types
    const globalTypes = allTypes.filter(t => t.userId === null);
    const userTypes = allTypes.filter(t => t.userId !== null);

    console.log(`Global: ${globalTypes.length}, User-Specific: ${userTypes.length}`);

    const toDeleteIds = new Set<number>();

    // 1. Check for duplicates within GLOBAL types (keep lowest ID)
    const seenGlobal = new Map<string, number>(); // slug -> id
    for (const t of globalTypes) {
        if (seenGlobal.has(t.slug)) {
            console.log(`Found duplicate GLOBAL type: ${t.slug} (ID: ${t.id} is duplicate of ${seenGlobal.get(t.slug)})`);
            toDeleteIds.add(t.id);
        } else {
            seenGlobal.set(t.slug, t.id);
        }
    }

    // 2. Check for User Types that shadow Global types (Redundant)
    for (const t of userTypes) {
        if (seenGlobal.has(t.slug)) {
            console.log(`Found REDUNDANT User type: ${t.slug} (ID: ${t.id} shadows Global ID: ${seenGlobal.get(t.slug)})`);
            toDeleteIds.add(t.id);
        }
    }

    // 3. Check for duplicates within User types (same user, same slug - keep lowest ID)
    // Key: userId:slug
    const seenUser = new Map<string, number>();
    for (const t of userTypes) {
        if (toDeleteIds.has(t.id)) continue; // Skip already marked

        const key = `${t.userId}:${t.slug}`;
        if (seenUser.has(key)) {
            console.log(`Found duplicate USER type: ${t.slug} for User ${t.userId} (ID: ${t.id} is duplicate of ${seenUser.get(key)})`);
            toDeleteIds.add(t.id);
        } else {
            seenUser.set(key, t.id);
        }
    }

    console.log(`\nFound ${toDeleteIds.size} types to delete.`);

    if (toDeleteIds.size > 0) {
        for (const id of toDeleteIds) {
            await db.delete(customCardTypes).where(eq(customCardTypes.id, id));
            console.log(`Deleted ID ${id}`);
        }
    }

    console.log("Cleanup complete.");
    process.exit(0);
}

fixDuplicates().catch(console.error);
