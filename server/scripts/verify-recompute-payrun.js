const { pool } = require("../src/config/mysqlDb");
const { computePayrun, getPayrunById } = require("../src/services/payroll-engine.service");

async function verify() {
  try {
    console.log("Recomputing Payrun #30 (July 2026)...");

    // First reset status to Processing/Draft so computePayrun will recalculate
    await pool.query(`UPDATE payruns SET status = 'Draft' WHERE id = 30;`);

    const updated = await computePayrun(30, "usr-paymgr-002");
    console.log("Payrun 30 Recomputed Successfully!");
    console.log("Status:", updated.status);
    console.log("Employee Count:", updated.employee_count);
    console.log("Total Gross:", updated.total_gross);
    console.log("Total Deductions:", updated.total_deductions);
    console.log("Total Net:", updated.total_net);

    const [slips] = await pool.query(`
      SELECT p.id, p.employee_id, e.first_name, e.last_name, c.wage, p.gross_amount, p.deduction_amount, p.net_amount, p.worked_days, p.paid_days
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      JOIN contracts c ON p.contract_id = c.id
      WHERE p.payrun_id = 30
      ORDER BY p.id ASC;
    `);

    console.log("\n--- ITEMIZED EMPLOYEE PAYSLIPS ---");
    console.table(slips);

    for (const s of slips) {
      const [lines] = await pool.query(`SELECT rule_code, category, amount FROM payslip_lines WHERE payslip_id = ? ORDER BY sequence`, [s.id]);
      console.log(`\nLines for ${s.first_name} ${s.last_name} (Wage: ₹${s.wage}):`);
      console.table(lines);
    }

    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

verify();
