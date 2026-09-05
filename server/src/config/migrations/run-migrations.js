const fs = require("fs");
const path = require("path");
const { pool } = require("../mysqlDb");

async function runMigrations() {
  console.log("🔄 Running safe payroll database migrations on active database...");
  const migrationPath = path.join(__dirname, "01_payroll_constraints_and_indexes_mysql.sql");
  const sql = fs.readFileSync(migrationPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("✅ 01_payroll_constraints_and_indexes_mysql.sql executed successfully.");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    throw err;
  }
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = runMigrations;
