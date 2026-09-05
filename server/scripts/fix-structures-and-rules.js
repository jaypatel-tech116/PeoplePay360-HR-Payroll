const { pool } = require("../src/config/mysqlDb");

async function fixDatabaseStructuresAndRules() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("1. Activating all salary structures...");
    await conn.query("UPDATE salary_structures SET is_active = 1 WHERE is_active = 0;");

    console.log("2. Checking indexes on salary_rules...");
    const [indexes] = await conn.query("SHOW INDEXES FROM salary_rules WHERE Key_name = 'code';");
    if (indexes.length > 0) {
      console.log("Dropping table-wide unique index 'code' from salary_rules...");
      await conn.query("ALTER TABLE salary_rules DROP INDEX code;");
    }

    const [compIndex] = await conn.query("SHOW INDEXES FROM salary_rules WHERE Key_name = 'unique_struct_rule_code';");
    if (compIndex.length === 0) {
      console.log("Adding composite unique index (salary_structure_id, code)...");
      await conn.query("ALTER TABLE salary_rules ADD UNIQUE KEY unique_struct_rule_code (salary_structure_id, code);");
    }

    console.log("3. Fetching base dynamic rules from Structure 1...");
    const [baseRules] = await conn.query(`
      SELECT code, name, category, sequence, calculation_type, fixed_amount, percentage, formula, default_value, is_active
      FROM salary_rules
      WHERE salary_structure_id = 1
      ORDER BY sequence ASC;
    `);

    const [otherStructures] = await conn.query("SELECT id, name FROM salary_structures WHERE id != 1;");

    for (const st of otherStructures) {
      console.log(`Seeding rules for Structure ${st.id} (${st.name})...`);
      for (const r of baseRules) {
        await conn.query(`
          INSERT INTO salary_rules (salary_structure_id, code, name, category, sequence, calculation_type, fixed_amount, percentage, formula, default_value, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            category = VALUES(category),
            sequence = VALUES(sequence),
            calculation_type = VALUES(calculation_type),
            fixed_amount = VALUES(fixed_amount),
            percentage = VALUES(percentage),
            formula = VALUES(formula),
            is_active = 1;
        `, [
          st.id,
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
    }

    await conn.commit();
    console.log("✅ Database successfully updated! All structures have complete active rules.");

    const [summary] = await conn.query(`
      SELECT ss.id, ss.code, ss.name, ss.is_active, count(sr.id) as rule_count
      FROM salary_structures ss
      LEFT JOIN salary_rules sr ON ss.id = sr.salary_structure_id
      GROUP BY ss.id, ss.code, ss.name, ss.is_active;
    `);
    console.table(summary);
    process.exit(0);
  } catch (err) {
    await conn.rollback();
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

fixDatabaseStructuresAndRules();
