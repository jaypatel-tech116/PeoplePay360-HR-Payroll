const { pool } = require("../src/config/mysqlDb");

async function checkMysqlCounts() {
  try {
    const tables = [
      'roles', 'users', 'departments', 'employees', 'working_schedules',
      'contracts', 'attendance', 'leave_types', 'leave_allocations',
      'leave_requests', 'salary_structures', 'salary_rules',
      'payruns', 'payslips', 'payslip_lines', 'audit_logs'
    ];
    console.log("\n📊 PEOPLEPAY360 - MYSQL TABLE ROW COUNTS\n---------------------------------------");
    for (const t of tables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM \`${t}\`;`);
        console.log(`  ✓ ${t.padEnd(22)} : ${rows[0].count} rows`);
      } catch (err) {
        console.log(`  ✗ ${t.padEnd(22)} : ERROR - ${err.message}`);
      }
    }
    console.log("---------------------------------------\n");
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

checkMysqlCounts();
