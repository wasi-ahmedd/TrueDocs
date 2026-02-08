
import { apiRequest } from "../client/src/lib/queryClient"; // Can't easily import client code in standalone script without DOM.
// We'll use native fetch and a simple wrapper.

const BASE_URL = "http://localhost:3000";

async function request(method: string, url: string, data?: any, cookie?: string) {
    const headers: any = { "Content-Type": "application/json" };
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = text; }

    return { status: res.status, headers: res.headers, body: json };
}

async function run() {
    console.log("Starting Isolation Verification...");

    const userA = `userA_${Date.now()}`;
    const userB = `userB_${Date.now()}`;
    const pass = "password123";

    // 1. Register User A
    console.log(`\n1. Registering User A (${userA})...`);
    let res = await request("POST", "/api/register", { username: userA, password: pass });
    if (res.status !== 200) throw new Error(`Failed to register A: ${JSON.stringify(res.body)}`);
    const cookieA = res.headers.get("set-cookie")?.split(";")[0];
    console.log("   User A registered.");

    // 2. Create Person for A
    console.log("\n2. Creating 'Person A' for User A...");
    res = await request("POST", "/api/people", { name: "Person A" }, cookieA);
    if (res.status !== 201) throw new Error(`Failed to create person: ${JSON.stringify(res.body)}`);
    console.log("   Person A created.");

    // 3. Register User B
    console.log(`\n3. Registering User B (${userB})...`);
    res = await request("POST", "/api/register", { username: userB, password: pass });
    if (res.status !== 200) throw new Error(`Failed to register B: ${JSON.stringify(res.body)}`);
    const cookieB = res.headers.get("set-cookie")?.split(";")[0];
    console.log("   User B registered.");

    // 4. Create Person for B
    console.log("\n4. Creating 'Person B' for User B...");
    res = await request("POST", "/api/people", { name: "Person B" }, cookieB);
    if (res.status !== 201) throw new Error(`Failed to create person: ${JSON.stringify(res.body)}`);
    console.log("   Person B created.");

    // 5. Verify A sees ONLY A
    console.log("\n5. Verifying User A Data...");
    res = await request("GET", "/api/people", null, cookieA);
    const peopleA = res.body;
    console.log(`   User A sees: ${peopleA.map((p: any) => p.name).join(", ")}`);
    if (peopleA.length !== 1 || peopleA[0].name !== "Person A") {
        console.error("FAILED: User A should only see Person A");
    } else {
        console.log("   SUCCESS: User A sees only their own data.");
    }

    // 6. Verify B sees ONLY B
    console.log("\n6. Verifying User B Data...");
    res = await request("GET", "/api/people", null, cookieB);
    const peopleB = res.body;
    console.log(`   User B sees: ${peopleB.map((p: any) => p.name).join(", ")}`);
    if (peopleB.length !== 1 || peopleB[0].name !== "Person B") {
        console.error("FAILED: User B should only see Person B");
    } else {
        console.log("   SUCCESS: User B sees only their own data.");
    }
}

run().catch(console.error);
