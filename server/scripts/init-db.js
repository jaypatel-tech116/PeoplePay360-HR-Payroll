const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/db");

/**
 * Script to initialize database tables in PostgreSQL / Supabase
 * Reads schema.sql and runs queries against DATABASE_URL.
 */
async function initDb() {
  console.log("🚀 Initializing PostgreSQL Database Schema...");

  try {
    const schemaPath = path.join(__dirname, "../src/config/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    await pool.query(sql);
    console.log("✅ Database schema initialized successfully: `users` table and indexes ready.");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
