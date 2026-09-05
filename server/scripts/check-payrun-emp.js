const { pool } = require("../src/config/mysqlDb");

async function check() {
  const [runs] = await pool.query('SELECT id, run_number, month, year, status, employee_count FROM payruns WHERE run_number LIKE "PAY-2026-11%";');
  console.log("November 2026 payruns:", runs);

  process.exit(0);
}

check();
