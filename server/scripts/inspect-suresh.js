require('dotenv').config();
const { pool } = require('../src/config/mysqlDb');

async function main() {
  const [emps] = await pool.query(`
    SELECT e.*, c.wage, c.id as contract_id, c.salary_structure_id
    FROM employees e
    JOIN contracts c ON c.employee_id = e.id
    WHERE e.first_name LIKE '%Suresh%' OR e.last_name LIKE '%Malhotra%'
  `);
  console.log('Employee & Contract:', emps);

  const [rules] = await pool.query(`
    SELECT id, salary_structure_id, sequence, name, code, category, calculation_type, percentage, fixed_amount, formula
    FROM salary_rules
    ORDER BY sequence ASC
  `);
  console.log('Current Salary Rules in DB:');
  console.table(rules);

  const [contracts] = await pool.query(`
    SELECT c.id, c.employee_id, e.employee_code, CONCAT(e.first_name, ' ', e.last_name) as name, c.wage, c.status
    FROM contracts c
    JOIN employees e ON c.employee_id = e.id
    WHERE e.employee_code = 'EMP0177' OR c.id = 106
  `);
  console.log('Contract for Suresh:', contracts);

  const [slips] = await pool.query(`
    SELECT p.id, p.payrun_id, p.employee_id, p.worked_days, p.paid_days, p.gross_amount, p.deduction_amount, p.net_amount
    FROM payslips p
    WHERE p.payrun_id = 61
  `);
  console.log('Payslip in payrun 61:', slips);

  const [lines] = await pool.query(`
    SELECT *
    FROM payslip_lines pl
    WHERE pl.payslip_id = 1505
    ORDER BY pl.sequence ASC
  `);
  console.log('Payslip 1505 lines:');
  console.table(lines);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
