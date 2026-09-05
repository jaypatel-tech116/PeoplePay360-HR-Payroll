const { pool } = require("../src/config/mysqlDb");

async function main() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM salary_rules LIKE 'quantity';");
    if (cols.length === 0) {
      console.log("Adding quantity column to salary_rules...");
      await pool.query("ALTER TABLE salary_rules ADD COLUMN quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00 AFTER sequence;");
      console.log("✅ quantity column added successfully.");
    } else {
      console.log("ℹ️ quantity column already exists.");
    }
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  } finally {
    process.exit(0);
  }
}

main();
