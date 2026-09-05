const { pool } = require("../src/config/mysqlDb");

const STANDARDIZED_RULES = [
  {
    code: "BASIC",
    name: "Basic Salary",
    category: "BASIC",
    sequence: 1,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 50.0000,
    formula: null,
    default_value: "50%",
    is_active: 1,
  },
  {
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
    code: "SPEC",
    name: "Special Allowance",
    category: "ALLOWANCE",
    sequence: 5,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "max(0, round(WAGE - (BASIC + HRA + CONV + MED), 2))",
    default_value: "Formula",
    is_active: 1,
  },
  {
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
    code: "ESI",
    name: "ESI",
    category: "DEDUCTION",
    sequence: 8,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "if(GROSS <= 21000, round(GROSS * 0.0075, 2), 0)",
    default_value: "0.75%",
    is_active: 1,
  },
  {
    code: "TDS",
    name: "TDS",
    category: "DEDUCTION",
    sequence: 9,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "if(GROSS > 50000, round((GROSS - 50000) * 0.10, 2), 0)",
    default_value: "Tax Slab",
    is_active: 1,
  },
  {
    code: "LOP",
    name: "Loss of Pay (Unpaid Leaves)",
    category: "DEDUCTION",
    sequence: 10,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "round((WAGE / SCHEDULED_DAYS) * LOP_DAYS, 2)",
    default_value: "Formula",
    is_active: 1,
  },
  {
    code: "OT",
    name: "Overtime Allowance",
    category: "ALLOWANCE",
    sequence: 11,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "round(OVERTIME_HOURS * (WAGE / (SCHEDULED_DAYS * 8)) * 1.5, 2)",
    default_value: "1.5x OT",
    is_active: 1,
  },
  {
    code: "BONUS",
    name: "Performance Bonus",
    category: "ALLOWANCE",
    sequence: 12,
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "0",
    is_active: 1,
  },
  {
    code: "LTA",
    name: "Leave Travel Allowance",
    category: "ALLOWANCE",
    sequence: 13,
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "0",
    is_active: 1,
  },
  {
    code: "LOAN",
    name: "Loan Deduction",
    category: "DEDUCTION",
    sequence: 14,
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "0",
    is_active: 1,
  },
  {
    code: "PF_EMP",
    name: "Employer PF Contribution",
    category: "OTHER",
    sequence: 15,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 12.0000,
    formula: null,
    default_value: "12%",
    is_active: 1,
  },
  {
    code: "GRAT",
    name: "Gratuity",
    category: "OTHER",
    sequence: 16,
    calculation_type: "FORMULA",
    fixed_amount: null,
    percentage: null,
    formula: "round((BASIC * 15 * 5) / 26, 2)",
    default_value: "Formula",
    is_active: 0,
  },
];

async function applyStandardizedSalaryRules() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("1. Deleting erroneous test rules (like Rule 93 ADVANCE)...");
    await conn.query("DELETE FROM salary_rules WHERE code = 'ADVANCE' OR name = 'rule 1';");

    console.log("2. Fetching all existing salary structures...");
    const [structures] = await conn.query("SELECT id, name FROM salary_structures ORDER BY id ASC;");
    console.log(`Found ${structures.length} salary structures.`);

    for (const struct of structures) {
      console.log(`Synchronizing rules for Structure ${struct.id}: "${struct.name}"...`);

      for (const rule of STANDARDIZED_RULES) {
        const [existing] = await conn.query(
          "SELECT id FROM salary_rules WHERE salary_structure_id = ? AND code = ?;",
          [struct.id, rule.code]
        );

        if (existing.length > 0) {
          await conn.query(
            `UPDATE salary_rules
             SET name = ?, category = ?, sequence = ?, calculation_type = ?,
                 fixed_amount = ?, percentage = ?, formula = ?, default_value = ?,
                 is_active = ?, updated_at = NOW()
             WHERE id = ?;`,
            [
              rule.name,
              rule.category,
              rule.sequence,
              rule.calculation_type,
              rule.fixed_amount,
              rule.percentage,
              rule.formula,
              rule.default_value,
              rule.is_active,
              existing[0].id,
            ]
          );
        } else {
          await conn.query(
            `INSERT INTO salary_rules (
               salary_structure_id, code, name, category, sequence,
               calculation_type, fixed_amount, percentage, formula, default_value, is_active, created_at, updated_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());`,
            [
              struct.id,
              rule.code,
              rule.name,
              rule.category,
              rule.sequence,
              rule.calculation_type,
              rule.fixed_amount,
              rule.percentage,
              rule.formula,
              rule.default_value,
              rule.is_active,
            ]
          );
        }
      }
    }

    await conn.commit();
    console.log("✅ All salary rules across all structures updated successfully!");

    // Print sample rules from structure 1
    const [sampleRules] = await pool.query(
      "SELECT id, salary_structure_id, code, name, category, sequence, calculation_type, percentage, fixed_amount, formula FROM salary_rules WHERE salary_structure_id = 1 ORDER BY sequence ASC;"
    );
    console.table(sampleRules);

    // Recompute payrun 47 and 48 if they exist and are not completed
    const payrollEngine = require("../src/services/payroll-engine.service");
    const [activePayruns] = await pool.query(
      "SELECT id, run_number, status, employee_count FROM payruns WHERE status IN ('Draft', 'Computed', 'Validated') ORDER BY id DESC LIMIT 5;"
    );

    console.log("3. Recomputing active payruns with new rules:");
    for (const pr of activePayruns) {
      if (pr.employee_count > 0 && pr.status !== "Draft") {
        console.log(`Recomputing Payrun ${pr.id} (${pr.run_number}, status: ${pr.status})...`);
        await payrollEngine.computePayrun(pr.id);
        const updated = await payrollEngine.getPayrunById(pr.id);
        console.log(`Payrun ${pr.id} updated: Gross = ₹${updated.total_gross}, Net = ₹${updated.total_net}`);
      }
    }

    console.log("🚀 Everything fixed and synchronized!");
    process.exit(0);
  } catch (err) {
    await conn.rollback();
    console.error("Error applying standardized salary rules:", err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

applyStandardizedSalaryRules();
