const { pool } = require("../src/config/mysqlDb");

const CANONICAL_RULES = [
  {
    id: 1,
    salary_structure_id: 1,
    code: "BASIC",
    name: "Basic Salary",
    category: "BASIC",
    sequence: 1,
    calculation_type: "FIXED",
    fixed_amount: 30000.00,
    percentage: null,
    formula: null,
    default_value: "-",
    is_active: 1,
  },
  {
    id: 2,
    salary_structure_id: 1,
    code: "HRA",
    name: "House Rent Allowance",
    category: "ALLOWANCE",
    sequence: 2,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 40.0000,
    formula: null,
    default_value: "40%",
    is_active: 1,
  },
  {
    id: 3,
    salary_structure_id: 1,
    code: "CONV",
    name: "Conveyance Allowance",
    category: "ALLOWANCE",
    sequence: 3,
    calculation_type: "FIXED",
    fixed_amount: 2500.00,
    percentage: null,
    formula: null,
    default_value: "2,500",
    is_active: 1,
  },
  {
    id: 4,
    salary_structure_id: 1,
    code: "MED",
    name: "Medical Allowance",
    category: "ALLOWANCE",
    sequence: 4,
    calculation_type: "FIXED",
    fixed_amount: 1500.00,
    percentage: null,
    formula: null,
    default_value: "1,500",
    is_active: 1,
  },
  {
    id: 5,
    salary_structure_id: 1,
    code: "SPEC",
    name: "Special Allowance",
    category: "ALLOWANCE",
    sequence: 5,
    calculation_type: "FIXED",
    fixed_amount: 5000.00,
    percentage: null,
    formula: null,
    default_value: "-",
    is_active: 1,
  },
  {
    id: 6,
    salary_structure_id: 1,
    code: "PF",
    name: "Provident Fund",
    category: "DEDUCTION",
    sequence: 6,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 12.0000,
    formula: null,
    default_value: "12%",
    is_active: 1,
  },
  {
    id: 7,
    salary_structure_id: 1,
    code: "PT",
    name: "Professional Tax",
    category: "DEDUCTION",
    sequence: 7,
    calculation_type: "FIXED",
    fixed_amount: 200.00,
    percentage: null,
    formula: null,
    default_value: "200",
    is_active: 1,
  },
  {
    id: 8,
    salary_structure_id: 1,
    code: "ESI",
    name: "ESI",
    category: "DEDUCTION",
    sequence: 8,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 0.7500,
    formula: null,
    default_value: "0.75%",
    is_active: 1,
  },
  {
    id: 9,
    salary_structure_id: 1,
    code: "TDS",
    name: "TDS",
    category: "DEDUCTION",
    sequence: 9,
    calculation_type: "FORMULA",
    fixed_amount: 1500.00,
    percentage: null,
    formula: "if(GROSS > 50000, round(GROSS * 0.05, 2), 0)",
    default_value: "-",
    is_active: 1,
  },
  {
    id: 10,
    salary_structure_id: 1,
    code: "GRAT",
    name: "Gratuity",
    category: "OTHER",
    sequence: 10,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "round((BASIC * 15 * 5) / 26, 2)",
    default_value: "-",
    is_active: 0,
  },
  {
    id: 11,
    salary_structure_id: 1,
    code: "BONUS",
    name: "Performance Bonus",
    category: "ALLOWANCE",
    sequence: 11,
    calculation_type: "FIXED",
    fixed_amount: 10000.00,
    percentage: null,
    formula: null,
    default_value: "-",
    is_active: 1,
  },
  {
    id: 12,
    salary_structure_id: 1,
    code: "LTA",
    name: "Leave Travel Allowance",
    category: "ALLOWANCE",
    sequence: 12,
    calculation_type: "FIXED",
    fixed_amount: 3000.00,
    percentage: null,
    formula: null,
    default_value: "3,000",
    is_active: 1,
  },
  {
    id: 13,
    salary_structure_id: 1,
    code: "OT",
    name: "Overtime Allowance",
    category: "ALLOWANCE",
    sequence: 13,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "round(OVERTIME_HOURS * (WAGE / (SCHEDULED_DAYS * 8)) * 1.5, 2)",
    default_value: "-",
    is_active: 1,
  },
  {
    id: 14,
    salary_structure_id: 1,
    code: "LOP",
    name: "Loss of Pay (Unpaid Leaves)",
    category: "DEDUCTION",
    sequence: 14,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "round((WAGE / SCHEDULED_DAYS) * LOP_DAYS, 2)",
    default_value: "-",
    is_active: 1,
  },
  {
    id: 15,
    salary_structure_id: 1,
    code: "LOAN",
    name: "Loan Deduction",
    category: "DEDUCTION",
    sequence: 15,
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "-",
    is_active: 1,
  },
  {
    id: 16,
    salary_structure_id: 1,
    code: "PF_EMP",
    name: "Employer PF Contribution",
    category: "OTHER",
    sequence: 16,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 12.0000,
    formula: null,
    default_value: "12%",
    is_active: 1,
  },
];

async function restoreSalaryRules() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("1. Safely remapping payslip_lines rule_ids before cleaning rules...");
    for (const rule of CANONICAL_RULES) {
      await conn.query(`
        UPDATE payslip_lines 
        SET rule_id = ? 
        WHERE rule_code = ?;
      `, [rule.id, rule.code]);
    }

    console.log("2. Deleting duplicate and cloned rules from salary_rules...");
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");
    await conn.query("DELETE FROM salary_rules;");

    console.log("3. Inserting original canonical 16 rules into salary_rules...");
    for (const r of CANONICAL_RULES) {
      await conn.query(`
        INSERT INTO salary_rules (
          id, salary_structure_id, code, name, category, sequence,
          calculation_type, fixed_amount, percentage, formula, default_value, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
      `, [
        r.id,
        r.salary_structure_id,
        r.code,
        r.name,
        r.category,
        r.sequence,
        r.calculation_type,
        r.fixed_amount,
        r.percentage,
        r.formula,
        r.default_value,
        r.is_active,
      ]);
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
    await conn.commit();

    console.log("✅ Canonical salary rules successfully restored!");

    const [rows] = await pool.query(`
      SELECT id, code, name, category, sequence, calculation_type, default_value, is_active 
      FROM salary_rules 
      ORDER BY sequence ASC;
    `);
    console.table(rows);
    console.log(`Total rules in database: ${rows.length}`);
    process.exit(0);
  } catch (err) {
    await conn.rollback();
    console.error("Failed to restore rules:", err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

restoreSalaryRules();
