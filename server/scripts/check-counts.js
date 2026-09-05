const { pool } = require("../src/config/db");

async function checkAllCounts() {
  try {
    const tables = [
      'roles', 'users', 'departments', 'employees', 'working_schedules',
      'contracts', 'attendance', 'leave_types', 'leave_allocations',
      'leave_requests', 'salary_structures', 'salary_rules',
      'payruns', 'payslips', 'payslip_lines', 'audit_logs'
    ];
    for (const t of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) FROM public.${t};`);
        console.log(`${t}: ${res.rows[0].count}`);
      } catch (err) {
        console.log(`${t}: Error - ${err.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkAllCounts();
