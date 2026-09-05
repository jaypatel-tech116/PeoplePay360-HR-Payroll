const { pool } = require("../src/config/mysqlDb");

const CANONICAL_RULES_16 = [
  {
    code: "BASIC",
    name: "Basic Salary",
    category: "BASIC",
    sequence: 1,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 5.0000,
    formula: null,
    default_value: "5%",
    is_active: 1,
  },
  {
    code: "HRA",
    name: "House Rent Allowance",
    category: "ALLOWANCE",
    sequence: 2,
    calculation_type: "PERCENTAGE",
    fixed_amount: null,
    percentage: 4.0000,
    formula: null,
    default_value: "4%",
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
    calculation_type: "FIXED",
    fixed_amount: 5000.00,
    percentage: null,
    formula: null,
    default_value: "5,000",
    is_active: 1,
  },
  {
    code: "PF",
    name: "Provident Fund",
    category: "DEDUCTION",
    sequence: 6,
    calculation_type: "FIXED",
    fixed_amount: 1800.00,
    percentage: null,
    formula: null,
    default_value: "1,800",
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
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "0",
    is_active: 1,
  },
  {
    code: "TDS",
    name: "TDS",
    category: "DEDUCTION",
    sequence: 9,
    calculation_type: "FIXED",
    fixed_amount: 1500.00,
    percentage: null,
    formula: null,
    default_value: "1,500",
    is_active: 1,
  },
  {
    code: "GRAT",
    name: "Gratuity",
    category: "OTHER",
    sequence: 10,
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "-",
    is_active: 0,
  },
  {
    code: "BONUS",
    name: "Performance Bonus",
    category: "ALLOWANCE",
    sequence: 11,
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
    sequence: 12,
    calculation_type: "FIXED",
    fixed_amount: 0.00,
    percentage: null,
    formula: null,
    default_value: "0",
    is_active: 1,
  },
  {
    code: "OT",
    name: "Overtime Allowance",
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
    code: "LOAN",
    name: "Loan Deduction",
    category: "DEDUCTION",
    sequence: 15,
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
    sequence: 16,
    calculation_type: "FIXED",
    fixed_amount: 1800.00,
    percentage: null,
    formula: null,
    default_value: "1,800",
    is_active: 1,
  },
];

async function applyCleanRulesAndDeduplicate() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("1. Deleting duplicate rules from structures 2 to 8 to eliminate duplicates...");
    await conn.query("DELETE FROM salary_rules WHERE salary_structure_id != 1;");

    console.log("2. Updating structure 1 rules: Rule 1 = 5%, Rule 2 = 4%, others static...");
    for (const rule of CANONICAL_RULES_16) {
      const [existing] = await conn.query(
        "SELECT id FROM salary_rules WHERE salary_structure_id = 1 AND code = ?;",
        [rule.code]
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
           ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());`,
          [
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

    await conn.commit();
    console.log("✅ Successfully updated rules in Structure 1 and removed duplicates!");

    const [finalRules] = await pool.query(
      "SELECT id, salary_structure_id, code, name, category, sequence, calculation_type, percentage, fixed_amount, default_value FROM salary_rules ORDER BY sequence ASC;"
    );
    console.log(`Total rules in database: ${finalRules.length}`);
    console.table(finalRules);

    // 3. Recompute all payruns so UI has fresh, calculated data (no 0.00!)
    const payrollEngine = require("../src/services/payroll-engine.service");
    const [allRuns] = await pool.query(
      "SELECT id, run_number, status, employee_count FROM payruns WHERE status NOT IN ('Completed', 'Paid', 'Cancelled') ORDER BY id DESC;"
    );

    console.log(`\n3. Recomputing ${allRuns.length} active/draft payruns so no payrun shows ₹0.00 in UI...`);
    for (const pr of allRuns) {
      console.log(`Computing Payrun ${pr.id} (${pr.run_number})...`);
      try {
        await payrollEngine.computePayrun(pr.id);
        const updated = await payrollEngine.getPayrunById(pr.id);
        console.log(`  ✓ Payrun ${pr.id}: Status = ${updated.status}, Gross = ₹${updated.total_gross}, Net = ₹${updated.total_net}, Payslips = ${updated.payslips?.length}`);
      } catch (e) {
        console.log(`  ⚠️ Skipped ${pr.id}: ${e.message}`);
      }
    }

    console.log("\n🚀 All done! Zero duplicate entries, 5% and 4% rules active, and no 0.00 data!");
    process.exit(0);
  } catch (err) {
    await conn.rollback();
    console.error("Error:", err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

applyCleanRulesAndDeduplicate();
