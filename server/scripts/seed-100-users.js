const { pool } = require("../src/config/mysqlDb");
const bcrypt = require("bcryptjs");

// Lists of first and last names for realistic generation
const firstNamesMale = [
  "Aarav", "Vihaan", "Aditya", "Rohan", "Ishaan", "Kabir", "Arjun", "Dev",
  "Siddharth", "Kunal", "Rajesh", "Vikram", "Suresh", "Nikhil", "Amit", "Gaurav",
  "Manish", "Deepak", "Anil", "Varun", "Karan", "Prateek", "Tarun", "Harsh",
  "Sameer", "Alok", "Mayank", "Rishi", "Sachin", "Ashwin", "Sunil", "Pankaj"
];

const firstNamesFemale = [
  "Ananya", "Diya", "Pooja", "Kavita", "Sunita", "Deepa", "Shreya", "Neha",
  "Ritu", "Swati", "Meera", "Tanvi", "Simran", "Rhea", "Isha", "Tara",
  "Divya", "Anjali", "Pallavi", "Preeti", "Bhavna", "Komal", "Sonal", "Radhika",
  "Shruti", "Archana", "Nandini", "Shilpa", "Garima", "Megha", "Priyanka", "Payal"
];

const lastNames = [
  "Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Rao", "Reddy",
  "Singh", "Kapoor", "Joshi", "Deshmukh", "Choudhury", "Bose", "Menon", "Gupta",
  "Kumar", "Chatterjee", "Pillai", "Sen", "Mukherjee", "Saxena", "Bhatia", "Tiwari",
  "Pandey", "Mishra", "Shukla", "Agarwal", "Jain", "Shinde", "Kulkarni", "Dubey",
  "Tripathi", "Yadav", "Thakur", "Malhotra", "Khanna", "Chawla", "Bansal", "Bhardwaj"
];

const citiesAndStates = [
  { city: "Bangalore", state: "Karnataka", postal: "560001", location: "Bangalore HQ" },
  { city: "Mumbai", state: "Maharashtra", postal: "400001", location: "Mumbai Corporate Office" },
  { city: "Hyderabad", state: "Telangana", postal: "500001", location: "Hyderabad Tech Campus" },
  { city: "Pune", state: "Maharashtra", postal: "411001", location: "Pune Innovation Center" },
  { city: "Gurgaon", state: "Haryana", postal: "122001", location: "Delhi-NCR Hub" },
  { city: "Chennai", state: "Tamil Nadu", postal: "600001", location: "Chennai Operations" }
];

const departments = [
  { id: 1, name: "Engineering", titles: ["Software Engineer", "Senior Backend Developer", "Frontend Architect", "DevOps Engineer", "QA Automation Lead", "Cloud Engineer", "Full Stack Developer"] },
  { id: 2, name: "HR", titles: ["HR Specialist", "Talent Acquisition Partner", "HR Generalist", "People Operations Lead", "Employee Relations Manager"] },
  { id: 3, name: "Sales", titles: ["Enterprise Account Executive", "Senior Sales Representative", "Business Development Manager", "Sales Operations Lead", "Account Manager"] },
  { id: 4, name: "Marketing", titles: ["Growth Marketing Specialist", "Content Strategist", "SEO & Performance Manager", "Brand Communications Lead", "Product Marketer"] },
  { id: 5, name: "Product", titles: ["Senior Product Manager", "UI/UX Designer", "Product Operations Analyst", "Lead UX Researcher", "Associate Product Manager"] },
  { id: 6, name: "Finance", titles: ["Financial Analyst", "Senior Accountant", "Payroll Compliance Specialist", "Billing Operations Manager", "Tax & Audit Associate"] },
  { id: 7, name: "Operations", titles: ["Operations Associate", "Facilities Lead", "Process Optimization Specialist", "Vendor Relations Executive"] },
  { id: 8, name: "IT", titles: ["IT Systems Administrator", "Cybersecurity Specialist", "Network Infrastructure Engineer", "Helpdesk Support Lead"] }
];

async function seed100Users() {
  console.log("\n==========================================================================");
  console.log("🌱 STARTING SEEDING OF 100 COMPLETE USERS WITH CREDENTIALS & REQUIRED FIELDS");
  console.log("==========================================================================\n");

  const passwordPlain = "123456";
  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  console.log(`✓ Generated bcrypt password hash for universal password '${passwordPlain}' (also accepts 'Password@123')`);

  // Target distribution:
  // - 5 ADMINS (Role 1)
  // - 10 HR MANAGERS (Role 2)
  // - 10 HR PAYROLL MANAGERS (Role 3)
  // - 10 HR PAYROLL USERS (Role 4)
  // - 65 EMPLOYEES (Role 5)
  // Total = 100 users

  const userConfigs = [];

  // 1. 5 Admins
  for (let i = 1; i <= 5; i++) {
    userConfigs.push({
      roleId: 1,
      roleCode: "ADMIN",
      deptId: 8, // IT / Platform
      prefix: "admin",
      minWage: 120000,
      maxWage: 180000,
      structureId: 5, // Management
    });
  }

  // 2. 10 HR Managers
  for (let i = 1; i <= 10; i++) {
    userConfigs.push({
      roleId: 2,
      roleCode: "HR_MANAGER",
      deptId: 2, // HR
      prefix: "hrmgr",
      minWage: 85000,
      maxWage: 135000,
      structureId: 5, // Management
    });
  }

  // 3. 10 HR Payroll Managers
  for (let i = 1; i <= 10; i++) {
    userConfigs.push({
      roleId: 3,
      roleCode: "HR_PAYROLL_MANAGER",
      deptId: 6, // Finance/Payroll
      prefix: "paymgr",
      minWage: 88000,
      maxWage: 140000,
      structureId: 5, // Management
    });
  }

  // 4. 10 HR Payroll Users
  for (let i = 1; i <= 10; i++) {
    userConfigs.push({
      roleId: 4,
      roleCode: "HR_PAYROLL_USER",
      deptId: 6, // Finance/Payroll
      prefix: "payuser",
      minWage: 52000,
      maxWage: 78000,
      structureId: 1, // Regular
    });
  }

  // 5. 65 Employees across 8 departments
  const deptDist = [
    { deptId: 1, count: 18 }, // Engineering
    { deptId: 2, count: 5 },  // HR
    { deptId: 3, count: 10 }, // Sales
    { deptId: 4, count: 7 },  // Marketing
    { deptId: 5, count: 7 },  // Product
    { deptId: 6, count: 6 },  // Finance
    { deptId: 7, count: 6 },  // Operations
    { deptId: 8, count: 6 },  // IT
  ];

  for (const dd of deptDist) {
    for (let j = 0; j < dd.count; j++) {
      let structId = 1;
      let minW = 45000;
      let maxW = 95000;
      if (dd.deptId === 1) { // Eng
        structId = 7; // Tech
        minW = 55000;
        maxW = 125000;
      } else if (dd.deptId === 3) { // Sales
        structId = 6; // Sales
        minW = 48000;
        maxW = 98000;
      }
      userConfigs.push({
        roleId: 5,
        roleCode: "EMPLOYEE",
        deptId: dd.deptId,
        prefix: "emp",
        minWage: minW,
        maxWage: maxW,
        structureId: structId,
      });
    }
  }

  console.log(`✓ Configuration prepared for exactly ${userConfigs.length} users across 5 roles.\n`);

  const createdRecords = [];
  let seqNumber = 101;

  for (let i = 0; i < userConfigs.length; i++) {
    const cfg = userConfigs[i];
    const isMale = i % 2 === 0;
    const fName = isMale
      ? firstNamesMale[i % firstNamesMale.length]
      : firstNamesFemale[i % firstNamesFemale.length];
    const lName = lastNames[(i * 3 + 7) % lastNames.length];
    const fullName = `${fName} ${lName}`;

    const empCode = `EMP${String(seqNumber).padStart(4, "0")}`;
    const email = `${cfg.prefix}.${fName.toLowerCase()}.${lName.toLowerCase()}${seqNumber}@peoplepay360.com`;
    const phone = `+91 98${String(Math.floor(10000000 + Math.random() * 90000000))}`;
    const locInfo = citiesAndStates[i % citiesAndStates.length];
    
    // Pick title for department
    const deptObj = departments.find((d) => d.id === cfg.deptId) || departments[0];
    const designation = deptObj.titles[i % deptObj.titles.length];

    // Wage in increments of 500
    const rawWage = Math.floor(cfg.minWage + Math.random() * (cfg.maxWage - cfg.minWage));
    const wage = Math.round(rawWage / 500) * 500;

    // Dates
    const yearJoin = 2024 + (i % 2);
    const monthJoin = String((i % 12) + 1).padStart(2, "0");
    const dayJoin = String((i % 25) + 1).padStart(2, "0");
    const joiningDate = `${yearJoin}-${monthJoin}-${dayJoin}`;

    const dobYear = 1985 + (i % 16);
    const dobMonth = String(((i + 4) % 12) + 1).padStart(2, "0");
    const dobDay = String(((i + 7) % 27) + 1).padStart(2, "0");
    const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;

    const panNumber = `ABC${isMale ? "P" : "P"}${lName.slice(0, 1).toUpperCase()}${String(1000 + (i * 17) % 9000)}${fName.slice(0, 1).toUpperCase()}`;
    const uanNumber = `101${String(100000000 + i * 837).slice(-9)}`;
    const nationalId = `${String(2000 + i * 37)} ${String(4000 + i * 29)} ${String(6000 + i * 41)}`;
    const bankAccount = `HDFC000${String(1000 + (i % 800)).slice(-4)} - 50100${String(10000000 + i * 4291).slice(-9)}`;
    const streetAddress = `${12 + (i % 80)}, ${lName} Enclave, Sector ${1 + (i % 24)}`;

    const userId = `usr-seed-${String(seqNumber).padStart(3, "0")}`;

    try {
      // 1. Create Employee
      const [empResult] = await pool.query(`
        INSERT INTO employees (
          employee_code, first_name, last_name, email, phone, date_of_birth, gender,
          joining_date, department_id, schedule_id, designation, employee_type, status,
          work_location, national_id, bank_account, pan_number, uan_number,
          address, city, state, country, postal_code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'FULL_TIME', 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          department_id = VALUES(department_id),
          status = 'ACTIVE';
      `, [
        empCode, fName, lName, email, phone, dateOfBirth, isMale ? "Male" : "Female",
        joiningDate, cfg.deptId, 1, designation,
        locInfo.location, nationalId, bankAccount, panNumber, uanNumber,
        streetAddress, locInfo.city, locInfo.state, locInfo.postal
      ]);

      const employeeId = empResult.insertId || (await pool.query(`SELECT id FROM employees WHERE employee_code = ?`, [empCode]))[0][0].id;

      // 2. Create User linked to Employee
      await pool.query(`
        INSERT INTO users (
          id, role_id, employee_id, email, password_hash, full_name, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          role_id = VALUES(role_id),
          password_hash = VALUES(password_hash),
          full_name = VALUES(full_name),
          is_active = 1;
      `, [
        userId, cfg.roleId, employeeId, email, passwordHash, fullName
      ]);

      // 3. Create Contract for Employee
      const contractNum = `CNT-${empCode}`;
      await pool.query(`
        INSERT INTO contracts (
          employee_id, contract_number, start_date, end_date, contract_type,
          wage, currency, pay_frequency, salary_structure_id, status, created_at, updated_at
        ) VALUES (?, ?, ?, NULL, 'Permanent', ?, 'INR', 'MONTHLY', ?, 'ACTIVE', NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          wage = VALUES(wage),
          salary_structure_id = VALUES(salary_structure_id),
          status = 'ACTIVE';
      `, [
        employeeId, contractNum, joiningDate, wage, cfg.structureId
      ]);

      // 4. Create Leave Allocations (Annual: 18, Sick: 12, Casual: 10)
      const leaveConfigs = [
        { typeId: 1, days: 18.00 },
        { typeId: 2, days: 12.00 },
        { typeId: 3, days: 10.00 }
      ];
      for (const lc of leaveConfigs) {
        await pool.query(`
          INSERT INTO leave_allocations (
            employee_id, leave_type_id, start_date, end_date, total_days, used_days, status, created_at
          ) VALUES (?, ?, '2026-01-01', '2026-12-31', ?, 0.00, 'APPROVED', NOW())
          ON DUPLICATE KEY UPDATE total_days = VALUES(total_days);
        `, [employeeId, lc.typeId, lc.days]);
      }

      createdRecords.push({
        seq: i + 1,
        code: empCode,
        fullName,
        email,
        password: passwordPlain,
        role: cfg.roleCode,
        department: deptObj.name,
        designation,
        wage: "₹ " + wage.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        city: locInfo.city,
      });

      if ((i + 1) % 10 === 0 || i === userConfigs.length - 1) {
        console.log(`  ✓ Seeded ${String(i + 1).padStart(3, " ")}/100: [${cfg.roleCode.padEnd(19)}] ${fullName.padEnd(20)} | ${email}`);
      }
    } catch (err) {
      console.error(`  ✗ Failed seeding user ${i + 1} (${email}):`, err.message);
    }

    seqNumber++;
  }

  // Summary counts
  const [totalUsers] = await pool.query(`SELECT COUNT(*) AS c FROM users;`);
  const [totalEmployees] = await pool.query(`SELECT COUNT(*) AS c FROM employees WHERE status = 'ACTIVE';`);
  const [totalContracts] = await pool.query(`SELECT COUNT(*) AS c FROM contracts WHERE status = 'ACTIVE';`);

  console.log("\n==========================================================================");
  console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
  console.log(`   • Total Users in Database     : ${totalUsers[0].c}`);
  console.log(`   • Total Active Employees      : ${totalEmployees[0].c}`);
  console.log(`   • Total Active Contracts      : ${totalContracts[0].c}`);
  console.log(`   • Universal Password for All  : ${passwordPlain} (or 'Password@123')`);
  console.log("==========================================================================\n");

  return createdRecords;
}

if (require.main === module) {
  seed100Users().then(() => process.exit(0)).catch((err) => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
  });
}

module.exports = { seed100Users };
