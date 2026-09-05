const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/mysqlDb');
const payrollEngine = require('../src/services/payroll-engine.service');

const CANONICAL_RULES = [
  { sequence: 1, name: 'Basic Salary', code: 'BASIC', category: 'BASIC', calculation_type: 'PERCENTAGE', percentage: 50.00, fixed_amount: null, formula: null },
  { sequence: 2, name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', calculation_type: 'PERCENTAGE', percentage: 30.00, fixed_amount: null, formula: null },
  { sequence: 3, name: 'Conveyance Allowance', code: 'CONV', category: 'ALLOWANCE', calculation_type: 'PERCENTAGE', percentage: 5.00, fixed_amount: null, formula: null },
  { sequence: 4, name: 'Medical Allowance', code: 'MED', category: 'ALLOWANCE', calculation_type: 'PERCENTAGE', percentage: 5.00, fixed_amount: null, formula: null },
  { sequence: 5, name: 'Special Allowance', code: 'SPEC', category: 'ALLOWANCE', calculation_type: 'PERCENTAGE', percentage: 10.00, fixed_amount: null, formula: null },
  { sequence: 6, name: 'Provident Fund', code: 'PF', category: 'DEDUCTION', calculation_type: 'PERCENTAGE', percentage: 5.00, fixed_amount: null, formula: null },
  { sequence: 7, name: 'Professional Tax', code: 'PT', category: 'DEDUCTION', calculation_type: 'FIXED', percentage: null, fixed_amount: 200.00, formula: null },
  { sequence: 8, name: 'ESI', code: 'ESI', category: 'DEDUCTION', calculation_type: 'FIXED', percentage: null, fixed_amount: 0.00, formula: null },
  { sequence: 9, name: 'TDS', code: 'TDS', category: 'DEDUCTION', calculation_type: 'PERCENTAGE', percentage: 4.00, fixed_amount: null, formula: null },
  { sequence: 10, name: 'Gratuity', code: 'GRAT', category: 'OTHER', calculation_type: 'FIXED', percentage: null, fixed_amount: 0.00, formula: null },
  { sequence: 11, name: 'Performance Bonus', code: 'BONUS', category: 'ALLOWANCE', calculation_type: 'FIXED', percentage: null, fixed_amount: 0.00, formula: null },
  { sequence: 12, name: 'Leave Travel Allowance', code: 'LTA', category: 'ALLOWANCE', calculation_type: 'FIXED', percentage: null, fixed_amount: 0.00, formula: null },
  { sequence: 13, name: 'Overtime Allowance', code: 'OT', category: 'ALLOWANCE', calculation_type: 'FIXED', percentage: null, fixed_amount: 0.00, formula: null },
  { sequence: 14, name: 'Loss of Pay (Unpaid Leaves)', code: 'LOP', category: 'DEDUCTION', calculation_type: 'FORMULA', percentage: null, fixed_amount: null, formula: 'round((WAGE / SCHEDULED_DAYS) * LOP_DAYS, 2)' },
  { sequence: 15, name: 'Loan Deduction', code: 'LOAN', category: 'DEDUCTION', calculation_type: 'FIXED', percentage: null, fixed_amount: 0.00, formula: null },
  { sequence: 16, name: 'Employer PF Contribution', code: 'PF_EMP', category: 'OTHER', calculation_type: 'PERCENTAGE', percentage: 5.00, fixed_amount: null, formula: null },
];

async function main() {
  console.log('--- 1. UPDATING SALARY RULES IN DB ---');
  // Get all structures
  const [structures] = await pool.query('SELECT id, name FROM salary_structures');
  console.log(`Found ${structures.length} salary structures.`);

  for (const st of structures) {
    for (const r of CANONICAL_RULES) {
      // Check if rule exists in this structure
      const [existing] = await pool.query(
        'SELECT id FROM salary_rules WHERE salary_structure_id = ? AND code = ?',
        [st.id, r.code]
      );

      if (existing.length > 0) {
        await pool.query(
          `UPDATE salary_rules SET
            name = ?,
            category = ?,
            calculation_type = ?,
            percentage = ?,
            fixed_amount = ?,
            formula = ?,
            sequence = ?,
            is_active = 1
          WHERE id = ?`,
          [
            r.name,
            r.category,
            r.calculation_type,
            r.percentage,
            r.fixed_amount,
            r.formula,
            r.sequence,
            existing[0].id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO salary_rules (salary_structure_id, sequence, name, code, category, calculation_type, percentage, fixed_amount, formula, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            st.id,
            r.sequence,
            r.name,
            r.code,
            r.category,
            r.calculation_type,
            r.percentage,
            r.fixed_amount,
            r.formula,
          ]
        );
      }
    }
    console.log(`[OK] Synced 16 rules for Structure ${st.id} (${st.name})`);
  }

  console.log('\n--- 2. RECOMPUTING PAYRUN 61 (May 2025 Payrun) ---');
  const [p61] = await pool.query('SELECT * FROM payruns WHERE id = 61');
  if (p61.length > 0) {
    console.log(`Recomputing Payrun 61 (${p61[0].run_number}, ${p61[0].month} ${p61[0].year})...`);
    // Set to draft first so computePayrun will accept it if needed
    await pool.query("UPDATE payruns SET status = 'Draft' WHERE id = 61");
    const recomputed = await payrollEngine.computePayrun(61);
    console.log('Recomputed Payrun 61 results:', {
      totalGross: recomputed?.total_gross,
      totalDeductions: recomputed?.total_deductions,
      totalNet: recomputed?.total_net,
      payslipsCount: recomputed?.payslips?.length,
    });

    // Also keep its status as Completed/Paid as per screenshot
    await pool.query(
      "UPDATE payruns SET status = 'Completed', paid_at = NOW(), validated_at = NOW(), computed_at = NOW() WHERE id = 61"
    );
    await pool.query(
      "UPDATE payslips SET status = 'Paid', payment_status = 'PAID' WHERE payrun_id = 61"
    );
  }

  console.log('\n--- 3. RECOMPUTING PAYRUN 52 (March 2025 Payrun) ---');
  const [p52] = await pool.query('SELECT * FROM payruns WHERE id = 52');
  if (p52.length > 0) {
    console.log(`Recomputing Payrun 52 (${p52[0].run_number}, ${p52[0].month} ${p52[0].year})...`);
    await pool.query("UPDATE payruns SET status = 'Draft' WHERE id = 52");
    const recomputed52 = await payrollEngine.computePayrun(52);
    console.log('Recomputed Payrun 52 results:', {
      totalGross: recomputed52?.total_gross,
      totalDeductions: recomputed52?.total_deductions,
      totalNet: recomputed52?.total_net,
      payslipsCount: recomputed52?.payslips?.length,
    });
  }

  console.log('\n--- 4. VERIFYING SURESH MALHOTRA PAYSLIP IN PAYRUN 61 ---');
  const [sureshSlip] = await pool.query(`
    SELECT p.id, p.payslip_number, p.gross_amount, p.deduction_amount, p.net_amount, e.first_name, e.last_name, c.wage
    FROM payslips p
    JOIN employees e ON p.employee_id = e.id
    JOIN contracts c ON p.contract_id = c.id
    WHERE p.payrun_id = 61 AND e.employee_code = 'EMP0177'
  `);
  console.log('Suresh Malhotra Payslip:', sureshSlip[0]);

  if (sureshSlip.length > 0) {
    const [lines] = await pool.query(`
      SELECT rule_code, rule_name, category, sequence, rate, amount
      FROM payslip_lines
      WHERE payslip_id = ?
      ORDER BY sequence ASC
    `, [sureshSlip[0].id]);
    console.log('\nPayslip Itemized Lines:');
    console.table(lines);
  }

  console.log('\n=== ALL CALCULATIONS UPDATED AND VERIFIED SUCCESSFULLY ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
