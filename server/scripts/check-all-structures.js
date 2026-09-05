const { pool } = require("../src/config/mysqlDb");

async function check() {
  try {
    const [structs] = await pool.query("SELECT id, name, is_active FROM salary_structures");
    for (const s of structs) {
      const [rules] = await pool.query("SELECT count(*) as count FROM salary_rules WHERE salary_structure_id = ?", [s.id]);
      console.log("Structure " + s.id + " (" + s.name + ") - is_active: " + s.is_active + ", rules count: " + rules[0].count);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
