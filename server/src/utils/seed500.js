const { pool } = require("../config/mysqlDb");
const bcrypt = require("bcryptjs");

const firstNames = [
  "Rahul", "Priya", "Vikram", "Sneha", "Aditya", "Neha", "Rohan", "Meera", "Amit", "Ananya",
  "Rajesh", "Deepak", "Sunita", "Pooja", "Suresh", "Kavita", "Manish", "Swati", "Karan", "Ritu", "Siddharth",
  "Divya", "Gaurav", "Anjali", "Varun", "Priti", "Nitin", "Bhavna", "Alok", "Shweta", "Tarun", "Kiran",
  "Sameer", "Rashmi", "Yash", "Tanvi", "Abhishek", "Roshni", "Aakash", "Juhi", "Mayank", "Nisha", "Harsh",
  "Richa", "Sanjay", "Simran", "Vikas", "Preeti", "Kunal", "Payal", "Pranav", "Aarti", "Ashok", "Sonal"
];

const lastNames = [
  "Sharma", "Mehta", "Rao", "Iyer", "Gupta", "Patel", "Desai", "Nair", "Shah", "Roy",
  "Kumar", "Verma", "Joshi", "Hegde", "Raina", "Pandey", "Agarwal", "Reddy", "Chawla", "Singh",
  "Malhotra", "Kulkarni", "Bhat", "Chopra", "Saxena", "Dutta", "Mukherjee", "Banerjee", "Menon", "Pillai",
  "Tripathi", "Mishra", "Trivedi", "Kapoor", "Khanna", "Nangia", "Gowda", "Naidu", "Yadav", "Chaudhary"
];

const designations = [
  "Software Developer", "Senior Engineer", "HR Manager", "Sales Executive", "UI/UX Designer",
  "DevOps Engineer", "HR Executive", "Marketing Specialist", "Accountant", "Financial Analyst",
  "QA Engineer", "Product Manager", "Operations Manager", "System Admin", "Data Analyst",
  "Backend Developer", "Frontend Developer", "Tech Lead", "Customer Success Lead", "Business Analyst"
];

const cities = [
  { city: "Bangalore", state: "Karnataka" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "New Delhi", state: "Delhi" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Gurgaon", state: "Haryana" },
  { city: "Noida", state: "Uttar Pradesh" }
];

async function seed500() {
  let connection;
  try {
    console.log("🌱 Starting Database Reset & Seed for 500 Employees...");
    connection = await pool.getConnection();

    // Disable Foreign Key Checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // Clear existing data safely
    await connection.query("TRUNCATE TABLE `payslip_lines`;");
    await connection.query("TRUNCATE TABLE `payslips`;");
    await connection.query("TRUNCATE TABLE `payruns`;");
    await connection.query("TRUNCATE TABLE `leave_requests`;");
    await connection.query("TRUNCATE TABLE `leave_allocations`;");
    await connection.query("TRUNCATE TABLE `attendance`;");
    await connection.query("TRUNCATE TABLE `contracts`;");
    await connection.query("TRUNCATE TABLE `users`;");
    await connection.query("TRUNCATE TABLE `employees`;");

    console.log("🧹 Cleared old records successfully.");

    // Seed Master Roles
    await connection.query(`
      INSERT INTO \`roles\` (\`id\`, \`code\`, \`name\`, \`description\`, \`is_active\`) VALUES
      (1, 'ADMIN', 'Administrator', 'Full platform administration and system governance', 1),
      (2, 'HR_MANAGER', 'HR Manager', 'HR master data, employee onboarding, leaves, and attendance', 1),
      (3, 'HR_PAYROLL_MANAGER', 'HR Payroll Manager', 'Full payroll cycle execution, structure governance, and disbursement', 1),
      (4, 'HR_PAYROLL_USER', 'HR Payroll User', 'Operational payroll execution and payslip processing', 1),
      (5, 'EMPLOYEE', 'Employee', 'Self-service portal, view payslips, and apply for leaves', 1)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Seed Master Departments
    await connection.query(`
      INSERT INTO \`departments\` (\`id\`, \`name\`, \`code\`, \`description\`, \`is_active\`) VALUES
      (1, 'Engineering', 'ENG', 'Product development and engineering team', 1),
      (2, 'HR', 'HR', 'Human resources and people operations', 1),
      (3, 'Sales', 'SAL', 'Sales and business development', 1),
      (4, 'Marketing', 'MKT', 'Marketing and communications', 1),
      (5, 'Product', 'PROD', 'Product design and UI/UX management', 1),
      (6, 'Finance', 'FIN', 'Finance, treasury, and accounting', 1),
      (7, 'Operations', 'OPS', 'Day-to-day operations and customer support', 1),
      (8, 'IT', 'IT', 'IT infrastructure, systems, and security', 1)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Seed Working Schedules
    await connection.query(`
      INSERT INTO \`working_schedules\` (\`id\`, \`name\`, \`code\`, \`monday_start\`, \`monday_end\`, \`break_minutes\`, \`weekly_hours\`, \`description\`, \`is_active\`) VALUES
      (1, 'Standard (9-6)', 'STD_9_6', '09:00:00', '18:00:00', 60, 40.00, 'Default full time schedule', 1),
      (2, 'Flexible', 'FLEX_10_7', '10:00:00', '19:00:00', 60, 40.00, 'Flexible working hours', 1),
      (3, 'Part Time', 'PART_TIME', '09:00:00', '13:00:00', 0, 20.00, 'Part time schedule', 1),
      (4, 'Shift A', 'SHIFT_A', '06:00:00', '14:00:00', 30, 45.00, 'Morning shift', 1),
      (5, 'Shift B', 'SHIFT_B', '14:00:00', '22:00:00', 30, 45.00, 'Evening shift', 1),
      (6, 'Shift C', 'SHIFT_C', '22:00:00', '06:00:00', 30, 45.00, 'Night shift', 1)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Seed Leave Types
    await connection.query(`
      INSERT INTO \`leave_types\` (\`id\`, \`code\`, \`name\`, \`unit\`, \`requires_allocation\`, \`is_paid\`, \`requires_approval\`, \`is_active\`) VALUES
      (1, 'AL', 'Annual Leave', 'DAYS', 1, 1, 1, 1),
      (2, 'SL', 'Sick Leave', 'DAYS', 1, 1, 1, 1),
      (3, 'CL', 'Casual Leave', 'DAYS', 1, 1, 1, 1),
      (4, 'ML', 'Maternity Leave', 'DAYS', 1, 1, 1, 1),
      (5, 'PL', 'Paternity Leave', 'DAYS', 1, 1, 1, 1)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Seed Salary Structures
    await connection.query(`
      INSERT INTO \`salary_structures\` (\`id\`, \`code\`, \`name\`, \`description\`, \`type\`, \`is_active\`) VALUES
      (1, 'SS001', 'Default Structure (Full Time)', 'Standard salary structure for full time employees', 'FT', 1),
      (2, 'SS002', 'Part Time Structure', 'For part time employees', 'PT', 1),
      (3, 'SS003', 'Contract Structure', 'For contract employees', 'Contract', 1),
      (4, 'SS004', 'Intern Structure', 'For interns and trainees', 'Intern', 1),
      (5, 'SS005', 'Management Structure', 'For management level employees', 'FT', 1),
      (6, 'SS006', 'Sales Structure', 'For sales team with incentive components', 'FT', 1),
      (7, 'SS007', 'Technical Structure', 'For technical engineering team', 'FT', 1),
      (8, 'SS008', 'Custom Structure', 'Custom structure for special roles', 'Contract', 1)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Seed Salary Rules
    await connection.query(`
      INSERT INTO \`salary_rules\` (\`id\`, \`salary_structure_id\`, \`code\`, \`name\`, \`category\`, \`sequence\`, \`calculation_type\`, \`fixed_amount\`, \`percentage\`, \`is_active\`) VALUES
      (1, 1, 'BASIC', 'Basic Pay', 'BASIC', 1, 'PERCENTAGE', 0.00, 50.00, 1),
      (2, 1, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 'PERCENTAGE', 0.00, 40.00, 1),
      (3, 1, 'SA', 'Special Allowance', 'ALLOWANCE', 3, 'FIXED', 10000.00, 0.00, 1),
      (4, 1, 'PF', 'Provident Fund', 'DEDUCTION', 4, 'PERCENTAGE', 0.00, 12.00, 1),
      (5, 1, 'PT', 'Professional Tax', 'DEDUCTION', 5, 'FIXED', 200.00, 0.00, 1),
      (6, 1, 'TDS', 'Income Tax (TDS)', 'DEDUCTION', 6, 'PERCENTAGE', 0.00, 10.00, 1)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Hashed default passwords
    const defaultPasswordHash = await bcrypt.hash("123456", 10);

    // 1. Seed Core Portal Users
    const coreUsers = [
      ['usr-admin-001', 1, null, 'admin@company.com', defaultPasswordHash, 'System Administrator'],
      ['usr-admin-002', 1, null, 'admin@gmail.com', defaultPasswordHash, 'Administrator'],
      ['usr-hr-001', 2, 2, 'hr@gmail.com', defaultPasswordHash, 'Priya Mehta (HR Manager)'],
      ['usr-paymgr-001', 3, null, 'payroll_mgr@gmail.com', defaultPasswordHash, 'HR Payroll Manager'],
      ['usr-paymgr-002', 3, null, 'payroll@gmail.com', defaultPasswordHash, 'Payroll Manager'],
      ['usr-payusr-001', 4, 6, 'neha@company.com', defaultPasswordHash, 'Neha Patel (Payroll User)'],
      ['usr-payusr-002', 4, null, 'payuser@gmail.com', defaultPasswordHash, 'Payroll Operator'],
      ['usr-emp-001', 5, 1, 'employee1@gmail.com', defaultPasswordHash, 'Rahul Sharma'],
      ['usr-emp-002', 5, null, 'employee@gmail.com', defaultPasswordHash, 'Rahul Sharma']
    ];

    for (const u of coreUsers) {
      await connection.query(
        `INSERT INTO \`users\` (\`id\`, \`role_id\`, \`employee_id\`, \`email\`, \`password_hash\`, \`full_name\`, \`is_active\`, \`last_login_at\`)
         VALUES (?, ?, ?, ?, ?, ?, 1, NOW());`,
        u
      );
    }

    console.log("👥 Generating 500 Employees (300 Linked with Full Salary & Payroll Data)...");

    const empValues = [];
    const contractValues = [];
    const userValues = [];
    const leaveAllocValues = [];
    const leaveReqValues = [];

    const years = [2022, 2023, 2024, 2025, 2026];

    for (let i = 1; i <= 500; i++) {
      const code = `EMP${i.toString().padStart(3, "0")}`;
      const fn = firstNames[(i - 1) % firstNames.length];
      const ln = lastNames[(i - 1) % lastNames.length];
      const fullName = `${fn} ${ln}`;
      const email = i === 1 ? 'rahul@company.com' : i === 2 ? 'priya@company.com' : i === 6 ? 'neha@company.com' : `emp${i}@company.com`;
      const phone = `+91 ${9800000000 + i}`;
      const dob = `199${(i % 9)}-${((i % 12) + 1).toString().padStart(2, '0')}-${((i % 28) + 1).toString().padStart(2, '0')}`;
      const gender = i % 2 === 0 ? "Female" : "Male";
      
      const joinYear = years[i % years.length];
      const joinMonth = ((i % 12) + 1).toString().padStart(2, "0");
      const joinDay = ((i % 28) + 1).toString().padStart(2, "0");
      const joiningDate = `${joinYear}-${joinMonth}-${joinDay}`;

      const deptId = (i % 8) + 1;
      const schedId = (i % 6) + 1;
      const desig = designations[i % designations.length];
      const loc = cities[i % cities.length];
      
      const empType = i > 450 ? "INTERN" : (i > 400 ? "CONTRACT" : (i > 350 ? "PART_TIME" : "FULL_TIME"));
      const status = i > 480 ? "INACTIVE" : "ACTIVE";
      const stage = i > 480 ? "EXITING" : (i > 420 ? "ON_LEAVE" : (i > 350 ? "NEW_JOINER" : "ACTIVE"));

      empValues.push([
        i, code, fn, ln, email, phone, dob, gender, joiningDate,
        deptId, schedId, desig, empType, status, stage,
        `${loc.city} Office`, `ID${1000 + i}`, `HDFC **** ${1000 + i}`,
        `PAN${10000 + i}`, `UAN${100000 + i}`, `${loc.city} Central`, loc.city, loc.state, "India"
      ]);

      // 300 Employees Linked Details (User, Contract, Allocations)
      if (i <= 300) {
        if (i !== 1 && i !== 2 && i !== 6) {
          userValues.push([
            `usr-emp-${code.toLowerCase()}`, 5, i, email, defaultPasswordHash, fullName
          ]);
        }

        const monthlyWage = 35000 + ((i * 1250) % 120000);
        const structId = (i % 8) + 1;
        contractValues.push([
          i, i, `CNT-${code}`, `${joinYear}-01-01`, null, 'Permanent', monthlyWage, 'INR', 'MONTHLY', structId, 'ACTIVE'
        ]);

        leaveAllocValues.push([i, 1, `${joinYear}-01-01`, `${joinYear}-12-31`, 18, 0, 'APPROVED']);
        leaveAllocValues.push([i, 2, `${joinYear}-01-01`, `${joinYear}-12-31`, 12, 0, 'APPROVED']);
        leaveAllocValues.push([i, 3, `${joinYear}-01-01`, `${joinYear}-12-31`, 8, 0, 'APPROVED']);

        if (i % 3 === 0) {
          const reqStatus = i % 5 === 0 ? "Pending" : (i % 7 === 0 ? "Rejected" : "Approved");
          leaveReqValues.push([
            i, (i % 3) + 1, `${joinYear}-08-10`, `${joinYear}-08-12`, 3, "Personal leave", reqStatus
          ]);
        }
      }
    }

    // Bulk Insert 500 Employees
    await connection.query(`
      INSERT INTO \`employees\` (
        \`id\`, \`employee_code\`, \`first_name\`, \`last_name\`, \`email\`, \`phone\`, \`date_of_birth\`,
        \`gender\`, \`joining_date\`, \`department_id\`, \`schedule_id\`, \`designation\`,
        \`employee_type\`, \`status\`, \`pipeline_stage\`, \`work_location\`, \`national_id\`, \`bank_account\`,
        \`pan_number\`, \`uan_number\`, \`address\`, \`city\`, \`state\`, \`country\`
      ) VALUES ?;
    `, [empValues]);

    // Bulk Insert 300 Users
    if (userValues.length > 0) {
      await connection.query(`
        INSERT INTO \`users\` (\`id\`, \`role_id\`, \`employee_id\`, \`email\`, \`password_hash\`, \`full_name\`)
        VALUES ?;
      `, [userValues]);
    }

    // Bulk Insert 300 Contracts
    if (contractValues.length > 0) {
      await connection.query(`
        INSERT INTO \`contracts\` (
          \`id\`, \`employee_id\`, \`contract_number\`, \`start_date\`, \`end_date\`,
          \`contract_type\`, \`wage\`, \`currency\`, \`pay_frequency\`, \`salary_structure_id\`, \`status\`
        ) VALUES ?;
      `, [contractValues]);
    }

    // Bulk Insert Leave Allocations & Requests
    if (leaveAllocValues.length > 0) {
      await connection.query(`
        INSERT INTO \`leave_allocations\` (\`employee_id\`, \`leave_type_id\`, \`start_date\`, \`end_date\`, \`total_days\`, \`used_days\`, \`status\`)
        VALUES ?;
      `, [leaveAllocValues]);
    }

    if (leaveReqValues.length > 0) {
      await connection.query(`
        INSERT INTO \`leave_requests\` (\`employee_id\`, \`leave_type_id\`, \`start_date\`, \`end_date\`, \`days\`, \`reason\`, \`status\`)
        VALUES ?;
      `, [leaveReqValues]);
    }

    console.log("💳 Seeding Payruns & Payslips for 300 Employees across 2025 and 2026...");

    const payrunMonths = [
      { month: "January", year: 2025, pStart: "2025-01-01", pEnd: "2025-01-31", pDate: "2025-01-31", status: "Completed" },
      { month: "February", year: 2025, pStart: "2025-02-01", pEnd: "2025-02-28", pDate: "2025-02-28", status: "Completed" },
      { month: "March", year: 2025, pStart: "2025-03-01", pEnd: "2025-03-31", pDate: "2025-03-31", status: "Completed" },
      { month: "April", year: 2025, pStart: "2025-04-01", pEnd: "2025-04-30", pDate: "2025-04-30", status: "Completed" },
      { month: "May", year: 2025, pStart: "2025-05-01", pEnd: "2025-05-31", pDate: "2025-05-31", status: "Completed" },
      { month: "June", year: 2025, pStart: "2025-06-01", pEnd: "2025-06-30", pDate: "2025-06-30", status: "Completed" },
      { month: "July", year: 2025, pStart: "2025-07-01", pEnd: "2025-07-31", pDate: "2025-07-31", status: "Completed" },
      { month: "August", year: 2025, pStart: "2025-08-01", pEnd: "2025-08-31", pDate: "2025-08-31", status: "Completed" },
      { month: "September", year: 2025, pStart: "2025-09-01", pEnd: "2025-09-30", pDate: "2025-09-30", status: "Completed" },
      { month: "October", year: 2025, pStart: "2025-10-01", pEnd: "2025-10-31", pDate: "2025-10-31", status: "Completed" },
      { month: "November", year: 2025, pStart: "2025-11-01", pEnd: "2025-11-30", pDate: "2025-11-30", status: "Completed" },
      { month: "December", year: 2025, pStart: "2025-12-01", pEnd: "2025-12-31", pDate: "2025-12-31", status: "Completed" },
      { month: "January", year: 2026, pStart: "2026-01-01", pEnd: "2026-01-31", pDate: "2026-01-31", status: "Completed" },
      { month: "February", year: 2026, pStart: "2026-02-01", pEnd: "2026-02-28", pDate: "2026-02-28", status: "Completed" },
      { month: "March", year: 2026, pStart: "2026-03-01", pEnd: "2026-03-31", pDate: "2026-03-31", status: "Completed" },
      { month: "April", year: 2026, pStart: "2026-04-01", pEnd: "2026-04-30", pDate: "2026-04-30", status: "Completed" },
      { month: "May", year: 2026, pStart: "2026-05-01", pEnd: "2026-05-31", pDate: "2026-05-31", status: "Completed" },
      { month: "June", year: 2026, pStart: "2026-06-01", pEnd: "2026-06-30", pDate: "2026-06-30", status: "Completed" },
      { month: "July", year: 2026, pStart: "2026-07-01", pEnd: "2026-07-31", pDate: "2026-07-31", status: "Completed" },
      { month: "August", year: 2026, pStart: "2026-08-01", pEnd: "2026-08-31", pDate: "2026-08-31", status: "Completed" },
      { month: "September", year: 2026, pStart: "2026-09-01", pEnd: "2026-09-30", pDate: "2026-09-30", status: "Processing" }
    ];

    let payrunId = 1;
    for (const pr of payrunMonths) {
      const totalGross = 300 * 65000;
      const totalDeduct = 300 * 9500;
      const totalNet = totalGross - totalDeduct;

      await connection.query(`
        INSERT INTO \`payruns\` (
          \`id\`, \`run_number\`, \`salary_structure_id\`, \`period_start\`, \`period_end\`, \`pay_date\`,
          \`month\`, \`year\`, \`status\`, \`employee_count\`, \`total_gross\`, \`total_deductions\`, \`total_net\`
        ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, 300, ?, ?, ?);
      `, [
        payrunId, `PAY-RUN-${pr.year}-${pr.month.slice(0, 3).toUpperCase()}`,
        pr.pStart, pr.pEnd, pr.pDate, pr.month, pr.year, pr.status, totalGross, totalDeduct, totalNet
      ]);

      if (pr.year === 2026 || (pr.year === 2025 && ["August", "September", "October", "November", "December"].includes(pr.month))) {
        const payslipValues = [];
        for (let eId = 1; eId <= 300; eId++) {
          const wage = 35000 + ((eId * 1250) % 120000);
          const gross = wage;
          const pf = Math.round(gross * 0.06);
          const tax = Math.round(gross * 0.08);
          const deduct = pf + tax + 200;
          const net = gross - deduct;
          const structId = (eId % 8) + 1;

          payslipValues.push([
            eId, payrunId, eId, structId, `SLIP-${pr.year}-${pr.month.slice(0, 3).toUpperCase()}-${eId.toString().padStart(3, "0")}`,
            pr.pStart, pr.pEnd, gross, deduct, net, 'Paid', 'PAID'
          ]);
        }

        await connection.query(`
          INSERT INTO \`payslips\` (
            \`employee_id\`, \`payrun_id\`, \`contract_id\`, \`salary_structure_id\`, \`payslip_number\`, \`period_start\`, \`period_end\`,
            \`gross_amount\`, \`deduction_amount\`, \`net_amount\`, \`status\`, \`payment_status\`
          ) VALUES ?;
        `, [payslipValues]);
      }

      payrunId++;
    }

    // Enable Foreign Key Checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("✅ SEED COMPLETE: 500 Employees created! (300 Linked with Contracts, Users, Payslips & Payruns).");
  } catch (err) {
    console.error("❌ Seed Error:", err);
    throw err;
  } finally {
    if (connection) connection.release();
  }
}

if (require.main === module) {
  seed500()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed500 };
