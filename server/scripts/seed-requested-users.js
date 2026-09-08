const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/mysqlDb");

async function seedRequestedUsers() {
  console.log("🌱 Seeding/Updating requested user accounts with password '123456'...");

  const hash = await bcrypt.hash("123456", 10);

  const usersToSeed = [
    {
      id: "usr-admin-002",
      email: "admin@gmail.com",
      roleCode: "ADMIN",
      fullName: "Admin User",
    },
    {
      id: "usr-paymgr-003",
      email: "hrpayrollmanager@gmail.com",
      roleCode: "HR_PAYROLL_MANAGER",
      fullName: "HR Payroll Manager",
    },
    {
      id: "usr-payusr-003",
      email: "hrpayrolluser@gmail.com",
      roleCode: "HR_PAYROLL_USER",
      fullName: "HR Payroll User",
    },
    {
      id: "usr-hr-001",
      email: "hr@gmail.com",
      roleCode: "HR_MANAGER",
      fullName: "HR Manager",
    },
    {
      id: "usr-emp-002",
      email: "employee@gmail.com",
      roleCode: "EMPLOYEE",
      fullName: "Employee User",
    },
  ];

  // Get roles map
  const [roles] = await pool.query("SELECT id, code FROM roles;");
  const roleMap = {};
  roles.forEach((r) => {
    roleMap[r.code] = r.id;
  });

  for (const user of usersToSeed) {
    const roleId = roleMap[user.roleCode];
    if (!roleId) {
      console.error(`❌ Role code ${user.roleCode} not found in database!`);
      continue;
    }

    // Check if user exists by email
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?;", [user.email]);

    if (existing.length > 0) {
      await pool.query(
        "UPDATE users SET password_hash = ?, role_id = ?, is_active = 1 WHERE email = ?;",
        [hash, roleId, user.email]
      );
      console.log(`✅ Updated existing user ${user.email} (Role: ${user.roleCode}) with password '123456'`);
    } else {
      await pool.query(
        "INSERT INTO users (id, role_id, email, password_hash, full_name, is_active) VALUES (?, ?, ?, ?, ?, 1);",
        [user.id, roleId, user.email, hash, user.fullName]
      );
      console.log(`✅ Created new user ${user.email} (Role: ${user.roleCode}) with password '123456'`);
    }
  }

  // Update password for all existing users to 123456 as requested
  await pool.query("UPDATE users SET password_hash = ?;", [hash]);
  console.log("✅ Set password '123456' for all users in the database.");

  process.exit(0);
}

seedRequestedUsers().catch((err) => {
  console.error("❌ Error seeding requested users:", err);
  process.exit(1);
});
