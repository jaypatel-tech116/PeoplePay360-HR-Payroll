const { pool } = require("../src/config/mysqlDb");

async function checkHrEmployees() {
  console.log("🔍 Checking MySQL Employees Data...");

  const [employees] = await pool.query(`
    SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.pipeline_stage, e.status, d.name as dept
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id;
  `);

  console.log(`📊 Total Employees found in DB: ${employees.length}`);
  console.table(employees);

  process.exit(0);
}

checkHrEmployees().catch((err) => {
  console.error(err);
  process.exit(1);
});
