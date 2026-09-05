const { pool } = require("../src/config/mysqlDb");

async function updateRules() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("Updating structure 1 salary rules for dynamic salary calculation...");

    // 1. BASIC: 50% of WAGE
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'PERCENTAGE', percentage = 50.0000, fixed_amount = NULL, formula = NULL, category = 'BASIC', sequence = 1
      WHERE salary_structure_id = 1 AND code = 'BASIC';
    `);

    // 2. HRA: 40% of BASIC
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'PERCENTAGE', percentage = 40.0000, fixed_amount = NULL, formula = NULL, category = 'ALLOWANCE', sequence = 2
      WHERE salary_structure_id = 1 AND code = 'HRA';
    `);

    // 3. CONV: Fixed 2500
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'FIXED', percentage = NULL, fixed_amount = 2500.00, formula = NULL, category = 'ALLOWANCE', sequence = 3
      WHERE salary_structure_id = 1 AND code = 'CONV';
    `);

    // 4. MED: Fixed 1500
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'FIXED', percentage = NULL, fixed_amount = 1500.00, formula = NULL, category = 'ALLOWANCE', sequence = 4
      WHERE salary_structure_id = 1 AND code = 'MED';
    `);

    // 5. SPEC: Balancing Allowance = max(0, WAGE - (BASIC + HRA + CONV + MED))
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'FORMULA', percentage = NULL, fixed_amount = NULL, formula = 'max(0, WAGE - (BASIC + HRA + CONV + MED))', category = 'ALLOWANCE', sequence = 5
      WHERE salary_structure_id = 1 AND code = 'SPEC';
    `);

    // 6. PF: 12% of BASIC
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'PERCENTAGE', percentage = 12.0000, fixed_amount = NULL, formula = NULL, category = 'DEDUCTION', sequence = 6
      WHERE salary_structure_id = 1 AND code = 'PF';
    `);

    // 7. PT: Fixed 200
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'FIXED', percentage = NULL, fixed_amount = 200.00, formula = NULL, category = 'DEDUCTION', sequence = 7
      WHERE salary_structure_id = 1 AND code = 'PT';
    `);

    // 8. ESI: 0.75% of GROSS
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'PERCENTAGE', percentage = 0.7500, fixed_amount = NULL, formula = NULL, category = 'DEDUCTION', sequence = 8
      WHERE salary_structure_id = 1 AND code = 'ESI';
    `);

    // 9. TDS: 5% of GROSS
    await conn.query(`
      UPDATE salary_rules 
      SET calculation_type = 'PERCENTAGE', percentage = 5.0000, fixed_amount = NULL, formula = NULL, category = 'DEDUCTION', sequence = 9
      WHERE salary_structure_id = 1 AND code = 'TDS';
    `);

    // 10. Check if LOP rule exists, if not insert or update
    const [existingLop] = await conn.query(`SELECT id FROM salary_rules WHERE salary_structure_id = 1 AND code = 'LOP';`);
    if (existingLop.length > 0) {
      await conn.query(`
        UPDATE salary_rules 
        SET name = 'Loss of Pay (Unpaid Leaves)', category = 'DEDUCTION', sequence = 10, calculation_type = 'FORMULA', formula = 'round((WAGE / SCHEDULED_DAYS) * LOP_DAYS, 2)', is_active = 1
        WHERE id = ?;
      `, [existingLop[0].id]);
    } else {
      await conn.query(`
        INSERT INTO salary_rules (salary_structure_id, code, name, category, sequence, calculation_type, formula, is_active, created_at, updated_at)
        VALUES (1, 'LOP', 'Loss of Pay (Unpaid Leaves)', 'DEDUCTION', 10, 'FORMULA', 'round((WAGE / SCHEDULED_DAYS) * LOP_DAYS, 2)', 1, NOW(), NOW());
      `);
    }

    await conn.commit();
    console.log("✅ Rules updated successfully in MySQL!");

    const [rules] = await conn.query(`SELECT id, code, name, category, sequence, calculation_type, percentage, fixed_amount, formula FROM salary_rules WHERE salary_structure_id = 1 ORDER BY sequence;`);
    console.log("Updated rules:", rules);
  } catch (err) {
    await conn.rollback();
    console.error("Error updating rules:", err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

updateRules().catch((err) => {
  console.error(err);
  process.exit(1);
});
