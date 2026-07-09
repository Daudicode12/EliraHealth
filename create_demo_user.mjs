import { createClient } from "@libsql/client";
import fs from "fs";

// Load env from .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
let dbUrl = "";
let dbToken = "";

envContent.split("\n").forEach(line => {
  if (line.startsWith("TURSO_CONNECTION_URL=")) {
    dbUrl = line.split("=")[1].replace(/"/g, "").trim();
  }
  if (line.startsWith("TURSO_AUTH_TOKEN=")) {
    dbToken = line.split("=")[1].replace(/"/g, "").trim();
  }
});

const client = createClient({
  url: dbUrl,
  authToken: dbToken,
});

async function main() {
  try {
    const demoUserId = 'demo-user-001';

    const profileRes = await client.execute({
      sql: "SELECT id FROM profiles WHERE id = ?",
      args: [demoUserId]
    });

    if (profileRes.rows.length === 0) {
      await client.execute({
        sql: "INSERT INTO profiles (id, first_name, last_name, email) VALUES (?, 'Demo', 'User', 'demo@example.com')",
        args: [demoUserId]
      });
      console.log("Created user in profiles table");
    }
    
    console.log("Demo user successfully created/verified!");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
