const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/mysqlDb');
const payrollEngine = require('../src/services/payroll-engine.service');

async function recomputeAll() {
  const [payruns] = await pool.query("SELECT id, run_number, status FROM payruns WHERE status IN ('Computed', 'Validated', 'Completed')");
  console.log(`Found ${payruns.length} active payruns to refresh.`);

  for (const pr of payruns) {
    try {
      const originalStatus = pr.status;
      await pool.query("UPDATE payruns SET status = 'Draft' WHERE id = ?", [pr.id]);
      const computed = await payrollEngine.computePayrun(pr.id);
      await pool.query("UPDATE payruns SET status = ? WHERE id = ?", [originalStatus, pr.id]);
      if (originalStatus === 'Completed') {
        await pool.query("UPDATE payslips SET status = 'Paid', payment_status = 'PAID' WHERE payrun_id = ?", [pr.id]);
      }
      console.log(`[REFRESHED] Payrun ${pr.id} (${pr.run_number}): Gross=${computed.total_gross}, Net=${computed.total_net}`);
    } catch (e) {
      console.log(`[SKIPPED] Payrun ${pr.id} (${pr.run_number}): ${e.message}`);
    }
  }

  const [checkPayruns] = await pool.query("SELECT id, run_number, month, year, status, total_gross, total_deductions, total_net FROM payruns WHERE status IN ('Computed', 'Validated', 'Completed')");
  console.table(checkPayruns);
  process.exit(0);
}

recomputeAll().catch(e => {
  console.error(e);
  process.exit(1);
});
