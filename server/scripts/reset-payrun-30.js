const { pool } = require("../src/config/mysqlDb");

async function reset() {
  try {
    await pool.query("UPDATE payruns SET status = 'Computed', validated_at = NULL, paid_at = NULL WHERE id = 30;");
    await pool.query("UPDATE payslips SET status = 'Computed', payment_status = 'UNPAID' WHERE payrun_id = 30;");
    console.log("✅ Payrun 30 successfully reset to Computed state for interactive testing!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
