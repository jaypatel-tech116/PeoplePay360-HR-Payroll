const { pool } = require("../src/config/mysqlDb");

async function seedAllStructures() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("1. Activating all salary structures...");
    await conn.query("UPDATE salary_structures SET is_active = 1 WHERE is_active = 0;");

    // Fetch the 11 active rules from structure 1
    const [baseRules] = await conn.query(`
      SELECT code, name, category, sequence, calculation_type, fixed_amount, percentage, formula, default_value, is_active
      FROM salary_rules
      WHERE salary_structure_id = 1
      ORDER BY sequence ASC;
    `);

    console.log(`Found ${baseRules.length} base rules in Structure 1.`);

    // Fetch all structures
    const [structures] = await conn.query("SELECT id, name FROM salary_structures WHERE id != 1;");

    for (const st of structures) {
      const [existing] = await conn.query("SELECT count(*) as count FROM salary_rules WHERE salary_structure_id = ?;", [st.id]);
      if (existing[0].count === 0) {
        console.log(`Seeding ${baseRules.length} rules for Structure ${st.id} (${st.name})...`);
        for (const r of baseRules) {
          await conn.query(`
            INSERT INTO salary_rules (salary_structure_id, code, name, category, sequence, calculation_type, fixed_amount, percentage, formula, default_value, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
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
    }

    await conn.commit();
    console.log("✅ All salary structures activated and populated with dynamic salary rules!");

    const [summary] = await conn.query(`
      SELECT ss.id, ss.name, ss.is_active, count(sr.id) as rule_count
      FROM salary_structures ss
      LEFT JOIN salary_rules sr ON ss.id = sr.salary_structure_id
      GROUP BY ss.id, ss.name, ss.is_active;
    `);
    console.table(summary);
    process.exit(0);
  } catch (err) {
    await conn.rollback();
    console.error("Failed to seed structures:", err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

seedAllStructures();
