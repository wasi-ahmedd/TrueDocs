
import { db } from "../server/db";
import { customCardTypes } from "../shared/schema";

async function checkTypes() {
    const types = await db.select().from(customCardTypes);
    console.log("Total Card Types:", types.length);
    console.table(types);
    process.exit(0);
}

checkTypes().catch(console.error);
