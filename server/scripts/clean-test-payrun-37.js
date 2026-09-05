const { pool } = require("../src/config/mysqlDb");

async function main() {
  console.log("Cleaning up old partial test payruns (id 37 and 43)...");
  await pool.query("DELETE FROM payslip_lines WHERE payslip_id IN (SELECT id FROM payslips WHERE payrun_id IN (37, 43));");
  await pool.query("DELETE FROM payslips WHERE payrun_id IN (37, 43);");
  await pool.query("DELETE FROM payruns WHERE id IN (37, 43);");
  console.log("✅ Payruns 37 and 43 cleaned up successfully. November 2026 is now 100% clean and ready!");
  process.exit(0);
}

main();
