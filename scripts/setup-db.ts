import { setupDb } from "../lib/db";

async function main() {
  await setupDb();
  console.log("Database setup complete.");
}

main().catch((err) => {
  console.error("Error setting up database:", err);
  process.exit(1);
});
