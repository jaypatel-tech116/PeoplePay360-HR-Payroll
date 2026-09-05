const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:Jay1126@127.0.0.1:5432/peoplepay360";

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
    ? false
    : { rejectUnauthorized: false },
});

/**
 * Initialize and seed the PeoplePay360 PostgreSQL Database (16 Tables)
 */
async function initDb() {
  console.log("🚀 Initializing PeoplePay360 PostgreSQL Database (16 Tables)...");

  try {
    const client = await pool.connect();
    console.log("🔌 Connected to PostgreSQL server.");

    // 1. Execute schema.sql
    console.log("📄 Executing schema.sql (DDL, Constraints, Indexes, Compatibility Functions)...");
    const schemaSql = fs.readFileSync(
      path.join(__dirname, "../src/config/schema.sql"),
      "utf-8"
    );
    await client.query(schemaSql);
    console.log("✅ 16 PostgreSQL tables created successfully.");

    // 2. Execute seed.sql
    console.log("🌱 Executing seed.sql (Populating test records for all 16 UI views)...");
    const seedSql = fs.readFileSync(
      path.join(__dirname, "../src/config/seed.sql"),
      "utf-8"
    );
    await client.query(seedSql);
    console.log("✅ Seed data inserted and sequences synchronized.");

    // 3. Verify counts
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    const empCount = await client.query("SELECT COUNT(*) AS total FROM employees;");
    const userCount = await client.query("SELECT COUNT(*) AS total FROM users;");
    const deptCount = await client.query("SELECT COUNT(*) AS total FROM departments;");
    const payrunCount = await client.query("SELECT COUNT(*) AS total FROM payruns;");
    const payslipCount = await client.query("SELECT COUNT(*) AS total FROM payslips;");

    console.log("\n=======================================================");
    console.log("🎉 PeoplePay360 PostgreSQL Database Ready!");
    console.log(`   - Total Tables:      ${tablesRes.rows.length} / 16`);
    console.log(`   - Seeded Users:      ${userCount.rows[0].total}`);
    console.log(`   - Seeded Employees:  ${empCount.rows[0].total}`);
    console.log(`   - Seeded Depts:      ${deptCount.rows[0].total}`);
    console.log(`   - Seeded Payruns:    ${payrunCount.rows[0].total}`);
    console.log(`   - Seeded Payslips:   ${payslipCount.rows[0].total}`);
    console.log("=======================================================\n");

    client.release();
  } catch (error) {
    console.error("❌ Error initializing PostgreSQL database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
