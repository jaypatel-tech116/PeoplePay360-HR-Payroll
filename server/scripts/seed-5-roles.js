const { pool } = require("../src/config/mysqlDb");
const bcrypt = require("bcryptjs");

async function setup5RoleUsers() {
  const hashHr = bcrypt.hashSync("hrhr", 10);
  const hashEmp = bcrypt.hashSync("123456", 10);
  const hashAdmin = bcrypt.hashSync("admin", 10);
  const hashPayroll = bcrypt.hashSync("payroll", 10);
  const hashPayuser = bcrypt.hashSync("payuser", 10);

  const users = [
    {
      id: "usr-admin-002",
      role_id: 1, // ADMIN
      employee_id: null,
      email: "admin@gmail.com",
      password_hash: hashAdmin,
      full_name: "Administrator",
    },
    {
      id: "usr-hr-001",
      role_id: 2, // HR_MANAGER
      employee_id: 2,
      email: "hr@gmail.com",
      password_hash: hashHr,
      full_name: "Priya Mehta (HR Lead)",
    },
    {
      id: "usr-paymgr-002",
      role_id: 3, // HR_PAYROLL_MANAGER
      employee_id: null,
      email: "payroll@gmail.com",
      password_hash: hashPayroll,
      full_name: "Payroll Manager",
    },
    {
      id: "usr-payusr-002",
      role_id: 4, // HR_PAYROLL_USER
      employee_id: null,
      email: "payuser@gmail.com",
      password_hash: hashPayuser,
      full_name: "Payroll Operator",
    },
    {
      id: "usr-emp-002",
      role_id: 5, // EMPLOYEE
      employee_id: 1,
      email: "employee@gmail.com",
      password_hash: hashEmp,
      full_name: "Rahul Sharma",
    },
  ];

  // Disassociate usr-emp-001 so usr-emp-002 can have employee_id 1
  await pool.query("UPDATE users SET employee_id = NULL WHERE id = 'usr-emp-001'");

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, role_id, employee_id, email, password_hash, full_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, true)
       ON DUPLICATE KEY UPDATE 
         role_id = VALUES(role_id),
         employee_id = VALUES(employee_id),
         password_hash = VALUES(password_hash),
         full_name = VALUES(full_name);`,
      [u.id, u.role_id, u.employee_id, u.email, u.password_hash, u.full_name]
    );
  }

  // Also support admin@company.com, employee1@gmail.com
  await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashAdmin, "admin@company.com"]);
  await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashEmp, "employee1@gmail.com"]);
  await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashPayroll, "payroll_mgr@gmail.com"]);

  const [allUsers] = await pool.query(`
    SELECT u.email, r.code AS role, u.full_name 
    FROM users u JOIN roles r ON u.role_id = r.id
    ORDER BY u.role_id ASC;
  `);
  console.log("\n=======================================================");
  console.log("✅ 5 Role-Wise Users Configured in MySQL:");
  console.table(allUsers);
  console.log("=======================================================\n");
  await pool.end();
}

setup5RoleUsers();
