require('dotenv').config();
const { pool } = require('../src/config/mysqlDb');

async function alignLeaveAllocations() {
  console.log("Starting full alignment of leave allocations to 25 days policy...");

  // 1. Clean up duplicate test approved leave requests for employee 1
  await pool.query(`
    UPDATE leave_requests 
    SET status = 'Rejected' 
    WHERE employee_id = 1 AND id IN (11, 14, 15, 16, 20)
  `);

  // 2. Clear out all existing allocations
  await pool.query("DELETE FROM leave_allocations");
  console.log("Cleared existing allocations table.");

  // 3. Ensure unique constraint exists on (employee_id, leave_type_id)
  try {
    await pool.query("ALTER TABLE leave_allocations ADD UNIQUE KEY uq_emp_leave_type (employee_id, leave_type_id)");
    console.log("Added UNIQUE KEY uq_emp_leave_type (employee_id, leave_type_id)");
  } catch (err) {
    if (!err.message.includes("Duplicate key")) {
      console.log("Constraint note:", err.message);
    }
  }

  // 4. Fetch all active employees
  const [employees] = await pool.query("SELECT id FROM employees WHERE status != 'TERMINATED'");
  console.log(`Inserting 25-day standard allocations for ${employees.length} employees...`);

  const year = new Date().getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const values = [];
  for (const emp of employees) {
    // Annual Leave: 12.00
    values.push([emp.id, 1, startDate, endDate, 12.00, 0.00, 'APPROVED']);
    // Sick Leave: 10.00
    values.push([emp.id, 2, startDate, endDate, 10.00, 0.00, 'APPROVED']);
    // Casual Leave: 3.00
    values.push([emp.id, 3, startDate, endDate, 3.00, 0.00, 'APPROVED']);
  }

  await pool.query(`
    INSERT INTO leave_allocations (employee_id, leave_type_id, start_date, end_date, total_days, used_days, status)
    VALUES ?
  `, [values]);

  console.log(`Successfully inserted ${values.length} allocation records.`);

  // 5. Compute actual used_days from approved leave requests
  await pool.query(`
    UPDATE leave_allocations la
    SET used_days = COALESCE((
      SELECT SUM(lr.days)
      FROM leave_requests lr
      WHERE lr.employee_id = la.employee_id
        AND lr.leave_type_id = la.leave_type_id
        AND lr.status IN ('Approved', 'APPROVED')
    ), 0.00)
  `);
  console.log("Recalculated used_days from actual approved requests in DB.");

  // 6. Inspect Employee 1
  const [e1Allocs] = await pool.query(`
    SELECT la.employee_id, lt.name, la.total_days, la.used_days, (la.total_days - la.used_days) as remaining
    FROM leave_allocations la
    JOIN leave_types lt ON la.leave_type_id = lt.id
    WHERE la.employee_id = 1
    ORDER BY lt.id ASC
  `);
  console.log("\nVerified Employee 1 Allocations:");
  console.table(e1Allocs);

  const totalAlloc = e1Allocs.reduce((s, a) => s + parseFloat(a.total_days), 0);
  const totalUsed = e1Allocs.reduce((s, a) => s + parseFloat(a.used_days), 0);
  const totalRem = totalAlloc - totalUsed;
  console.log(`Total Allocated: ${totalAlloc} Days (EXACT TARGET: 25 Days)`);
  console.log(`Total Used: ${totalUsed} Days`);
  console.log(`Total Remaining: ${totalRem} Days`);

  process.exit(0);
}

alignLeaveAllocations().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
