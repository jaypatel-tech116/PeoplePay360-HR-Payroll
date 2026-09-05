const { pool } = require("../src/config/mysqlDb");

async function check() {
  try {
    const [contracts] = await pool.query(
      "SELECT c.id, c.employee_id, e.employee_code, e.first_name, e.last_name, c.salary_structure_id, ss.name as struct_name, ss.is_active as struct_active " +
      "FROM contracts c " +
      "JOIN employees e ON c.employee_id = e.id " +
      "LEFT JOIN salary_structures ss ON c.salary_structure_id = ss.id " +
      "WHERE c.status = 'ACTIVE'"
    );
    console.table(contracts);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
