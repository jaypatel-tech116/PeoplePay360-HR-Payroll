const { pool } = require("../src/config/mysqlDb");

async function checkContracts() {
  const [rows] = await pool.query('SELECT COUNT(*) as c FROM contracts WHERE status = "ACTIVE" AND end_date IS NOT NULL;');
  console.log("Active contracts with end_date:", rows[0].c);

  const [sample] = await pool.query('SELECT id, employee_id, status, start_date, end_date FROM contracts WHERE status = "ACTIVE" AND end_date IS NOT NULL LIMIT 5;');
  console.log("Sample:", sample);

  process.exit(0);
}

checkContracts();
