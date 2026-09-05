const { Pool } = require("pg");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config();

// Extract database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ Warning: DATABASE_URL is not defined in environment variables!");
}

// Determine if SSL is required (Supabase and cloud PostgreSQL require SSL with self-signed certificate allowance)
const isLocalhost = connectionString && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));

// Initialize PostgreSQL connection pool using pg driver
const pool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

// Pool lifecycle events for logging
pool.on("connect", () => {
  console.log("🐘 PostgreSQL database connection established");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err.message);
});

/**
 * Execute parameterized query against the PostgreSQL pool
 * @param {string} text - SQL query string with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<import("pg").QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
