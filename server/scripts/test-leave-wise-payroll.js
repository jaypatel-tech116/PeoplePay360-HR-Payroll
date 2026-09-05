const { pool } = require("../src/config/mysqlDb");
const { computePayrun } = require("../src/services/payroll-engine.service");

async function testLeaveWisePayroll() {
  try {
    console.log("Testing leave-wise salary grant and LOP deduction...");

    // 1. Check leave types
    const [ltypes] = await pool.query(`SELECT * FROM leave_types WHERE is_paid = 0 OR affects_payroll = 1 LIMIT 1`);
    let unpaidTypeId = ltypes[0]?.id;
    if (!unpaidTypeId) {
      // Find any leave type and check
      const [allTypes] = await pool.query(`SELECT * FROM leave_types`);
      console.log("Available leave types:", allTypes);
      unpaidTypeId = allTypes.find(t => !t.is_paid || t.affects_payroll)?.id || 3; // Unpaid Leave
    }

    // 2. Insert a 2-day unpaid leave request for Priya Mehta (employee_id = 2) in July 2026
    const [insLeave] = await pool.query(`
      INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, days, reason, status, approved_by, approved_at, created_at, updated_at)
      VALUES (2, ?, '2026-07-15', '2026-07-16', 2.0, 'Personal emergency (unpaid)', 'Approved', 'usr-hr-001', NOW(), NOW(), NOW())
    `, [unpaidTypeId]);
    console.log("Inserted test approved unpaid leave #", insLeave.insertId);

    // 3. Recompute Payrun #30
    await pool.query(`UPDATE payruns SET status = 'Draft' WHERE id = 30;`);
    await computePayrun(30, "usr-paymgr-002");

    // 4. Inspect Priya's payslip lines
    const [slips] = await pool.query(`
      SELECT p.id, p.employee_id, e.first_name, e.last_name, c.wage, p.gross_amount, p.deduction_amount, p.net_amount, p.worked_days, p.paid_days
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      JOIN contracts c ON p.contract_id = c.id
      WHERE p.payrun_id = 30 AND p.employee_id = 2;
    `);

    console.log("\n--- PRIYA'S PAYSLIP WITH 2 UNPAID LEAVE DAYS ---");
    console.table(slips);

    const [lines] = await pool.query(`SELECT rule_code, category, amount FROM payslip_lines WHERE payslip_id = ? ORDER BY sequence`, [slips[0].id]);
    console.table(lines);

    // 5. Clean up the test leave request
    await pool.query(`DELETE FROM leave_requests WHERE id = ?`, [insLeave.insertId]);
    console.log("Cleaned up test leave request.");

    // Recompute back to normal
    await pool.query(`UPDATE payruns SET status = 'Draft' WHERE id = 30;`);
    await computePayrun(30, "usr-paymgr-002");
    console.log("Recomputed Payrun 30 back to clean state.");

    process.exit(0);
  } catch (err) {
    console.error("Leave test failed:", err);
    process.exit(1);
  }
}

testLeaveWisePayroll();
