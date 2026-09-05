const { pool } = require("../src/config/mysqlDb");

async function updateStages() {
  await pool.query(
    "UPDATE employees SET pipeline_stage = 'ACTIVE' WHERE employee_code IN ('EMP001', 'EMP002', 'EMP003')"
  );
  await pool.query(
    "UPDATE employees SET pipeline_stage = 'ON_LEAVE' WHERE employee_code IN ('EMP004', 'EMP005', 'EMP008')"
  );
  await pool.query(
    "UPDATE employees SET pipeline_stage = 'NEW_JOINER' WHERE employee_code = 'EMP006'"
  );
  await pool.query(
    "UPDATE employees SET pipeline_stage = 'EXITING' WHERE employee_code = 'EMP007'"
  );

  // Insert EMP009 and EMP010 if they do not already exist
  await pool.query(`
    INSERT INTO employees (
      id, employee_code, first_name, last_name, email, joining_date,
      department_id, designation, employee_type, status, pipeline_stage
    ) VALUES 
    (9, 'EMP009', 'Aarav', 'Mehta', 'aarav@company.com', '2025-09-01', 1, 'Software Developer', 'FULL_TIME', 'ACTIVE', 'NEW_JOINER'),
    (10, 'EMP010', 'Karan', 'Singh', 'karan@company.com', '2025-10-01', 5, 'Business Analyst', 'FULL_TIME', 'ACTIVE', 'NEW_JOINER')
    ON DUPLICATE KEY UPDATE designation = VALUES(designation)
  `);

  await pool.query(
    "SELECT setval(pg_get_serial_sequence('employees', 'id'), (SELECT MAX(id) FROM employees));"
  );

  console.log("✅ Stages & demo employees updated!");
  process.exit(0);
}

updateStages().catch((err) => {
  console.error("❌ Error updating stages:", err);
  process.exit(1);
});
