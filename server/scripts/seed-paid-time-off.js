require('dotenv').config();
const { pool } = require('../src/config/mysqlDb');

async function seedPaidTimeOff() {
  const [existing] = await pool.query('SELECT * FROM leave_types WHERE name = ?', ['Paid Time Off']);
  let typeId;
  if (existing.length === 0) {
    const [res] = await pool.query(
      `INSERT INTO leave_types (code, name, unit, requires_allocation, is_paid, affects_payroll, requires_approval, is_active, notes, approval_type, work_entry_type)
       VALUES ('PAID_TIME_OFF', 'Paid Time Off', 'DAYS', 1, 1, 0, 1, 1, 'Standard annual leave. Balance comes from approved allocations.', 'Manager', 'Leave Work Entry')`
    );
    typeId = res.insertId;
    console.log('Inserted Paid Time Off with ID:', typeId);
  } else {
    typeId = existing[0].id;
    await pool.query(
      `UPDATE leave_types SET 
        notes = 'Standard annual leave. Balance comes from approved allocations.',
        approval_type = 'Manager',
        work_entry_type = 'Leave Work Entry'
       WHERE id = ?`,
      [typeId]
    );
    console.log('Updated Paid Time Off with ID:', typeId);
  }

  // Allocate 15 days for all active employees
  const [employees] = await pool.query("SELECT id FROM employees WHERE status != 'TERMINATED'");
  const year = new Date().getFullYear();
  for (const emp of employees) {
    await pool.query(
      `INSERT INTO leave_allocations (employee_id, leave_type_id, start_date, end_date, total_days, used_days, status)
       VALUES (?, ?, ?, ?, 15.00, 0.00, 'APPROVED')
       ON DUPLICATE KEY UPDATE total_days = 15.00`,
      [emp.id, typeId, `${year}-01-01`, `${year}-12-31`]
    );
  }
  console.log('Allocated Paid Time Off to', employees.length, 'active employees');
  process.exit(0);
}

seedPaidTimeOff().catch(err => {
  console.error(err);
  process.exit(1);
});
