const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function seed300Employees() {
  console.log("🚀 Seeding 300 Employees with 200 Linked Contracts, Payroll & Attendance Data...");

  const config = {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    multipleStatements: true,
  };

  let connection;

  try {
    connection = await mysql.createConnection(config);
    await connection.query("CREATE DATABASE IF NOT EXISTS `peoplepay360` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await connection.changeUser({ database: "peoplepay360" });

    console.log("📄 Executing schema_mysql.sql...");
    const schemaSql = fs.readFileSync(path.join(__dirname, "../src/config/schema_mysql.sql"), "utf-8");
    await connection.query(schemaSql);
    console.log("✅ Schema initialized.");

    // 1. Roles
    await connection.query(`
      INSERT INTO roles (id, code, name, description) VALUES
      (1, 'ADMIN', 'Admin', 'Full System Access'),
      (2, 'HR_MANAGER', 'HR Manager', 'Manages Employees & HR'),
      (3, 'HR_PAYROLL_MANAGER', 'HR Payroll Manager', 'Manages & Approves Payroll'),
      (4, 'HR_PAYROLL_USER', 'HR Payroll User', 'Processes Payroll & Payslips'),
      (5, 'EMPLOYEE', 'Employee', 'Employee Portal Access')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 2. Departments
    await connection.query(`
      INSERT INTO departments (id, code, name, description) VALUES
      (1, 'ENG', 'Engineering', 'Software Engineering & IT'),
      (2, 'HR', 'Human Resources', 'HR & People Operations'),
      (3, 'SALES', 'Sales & Marketing', 'Business Development & Sales'),
      (4, 'PROD', 'Product Management', 'Product Design & Management'),
      (5, 'FIN', 'Finance & Payroll', 'Accounting & Financial Ops'),
      (6, 'OPS', 'Operations', 'Internal Infrastructure & Ops'),
      (7, 'MKT', 'Marketing', 'Brand & Performance Marketing'),
      (8, 'IT', 'IT Support', 'IT Assets & Helpdesk')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 3. Working Schedules
    await connection.query(`
      INSERT INTO working_schedules (id, code, name, monday_start, monday_end, weekly_hours, description) VALUES
      (1, 'STD-9-6', 'Standard (9 AM - 6 PM)', '09:00:00', '18:00:00', 40.00, 'Standard 40 hour work week'),
      (2, 'FLEX-10-7', 'Flexible (10 AM - 7 PM)', '10:00:00', '19:00:00', 40.00, 'Flexible shift'),
      (3, 'SHIFT-A', 'Shift A (6 AM - 2 PM)', '06:00:00', '14:00:00', 40.00, 'Morning shift')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 4. Salary Structures
    await connection.query(`
      INSERT INTO salary_structures (id, code, name, type, description) VALUES
      (1, 'SS-FT', 'Default Full Time Structure', 'FT', 'Standard salary structure for full time employees'),
      (2, 'SS-MGMT', 'Management Executive Structure', 'FT', 'Executive salary structure'),
      (3, 'SS-TECH', 'Engineering Tech Structure', 'FT', 'Technical team structure'),
      (4, 'SS-PT', 'Part Time Structure', 'PT', 'Part time employee structure')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 5. Salary Rules
    await connection.query(`
      INSERT INTO salary_rules (id, salary_structure_id, code, name, category, sequence, calculation_type, percentage, fixed_amount, default_value) VALUES
      (1, 1, 'BASIC', 'Basic Salary', 'BASIC', 1, 'PERCENTAGE', 0.5000, NULL, '50%'),
      (2, 1, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 'PERCENTAGE', 0.2000, NULL, '20%'),
      (3, 1, 'SPEC', 'Special Allowance', 'ALLOWANCE', 3, 'PERCENTAGE', 0.1500, NULL, '15%'),
      (4, 1, 'CONV', 'Conveyance Allowance', 'ALLOWANCE', 4, 'FIXED', NULL, 2500.00, '₹ 2,500'),
      (5, 1, 'PF', 'Provident Fund', 'DEDUCTION', 5, 'PERCENTAGE', 0.1200, NULL, '12%'),
      (6, 1, 'TDS', 'Tax Deducted at Source', 'DEDUCTION', 6, 'PERCENTAGE', 0.0500, NULL, '5%'),
      (7, 1, 'PT', 'Professional Tax', 'DEDUCTION', 7, 'FIXED', NULL, 200.00, '₹ 200')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 6. Leave Types
    await connection.query(`
      INSERT INTO leave_types (id, code, name, unit, is_paid) VALUES
      (1, 'CL', 'Casual Leave', 'DAYS', TRUE),
      (2, 'SL', 'Sick Leave', 'DAYS', TRUE),
      (3, 'AL', 'Annual Leave', 'DAYS', TRUE),
      (4, 'ML', 'Maternity/Paternity Leave', 'DAYS', TRUE)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    const firstNames = [
      "Aarav", "Aditi", "Aditya", "Amrita", "Ananya", "Anita", "Ankit", "Ansh", "Anushka", "Arjun",
      "Arnav", "Bhavya", "Dev", "Divya", "Gaurav", "Isha", "Ishaan", "Kavya", "Karan", "Kirti",
      "Kunal", "Manish", "Meera", "Mohit", "Neha", "Nikhil", "Nisha", "Parth", "Pooja", "Pranav",
      "Priya", "Rahul", "Rohan", "Rishi", "Riya", "Sameer", "Sanjay", "Shreya", "Siddharth", "Sneha",
      "Tanvi", "Utkarsh", "Varun", "Vedant", "Vikram", "Vraj", "Yash", "Zoya", "Aakash", "Deepak"
    ];

    const lastNames = [
      "Sharma", "Verma", "Gupta", "Mehta", "Patel", "Shah", "Joshi", "Rao", "Nair", "Iyer",
      "Desai", "Kumar", "Singh", "Reddy", "Chawla", "Bhasin", "Kapoor", "Malhotra", "Agarwal", "Bansal",
      "Chopra", "Das", "Dutta", "Kulkarni", "Mahajan", "Mukherjee", "Pandey", "Saxena", "Trivedi", "Yadav"
    ];

    const designations = [
      "Software Engineer", "Senior Developer", "Tech Lead", "Engineering Manager",
      "HR Generalist", "HR Executive", "HR Lead", "Recruiter",
      "Sales Executive", "Account Manager", "Business Development Lead",
      "Product Manager", "UI/UX Designer", "Product Analyst",
      "Financial Analyst", "Accountant", "Payroll Specialist",
      "Operations Associate", "Logistics Executive", "IT Support Specialist"
    ];

    console.log("👨‍💼 Generating 300 Employees...");
    const empValues = [];
    for (let i = 1; i <= 300; i++) {
      const code = `EMP${String(i).padStart(3, '0')}`;
      const fName = firstNames[(i - 1) % firstNames.length];
      const lName = lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length] + (i > 150 ? ` ${Math.floor(i / 10)}` : "");
      const email = i === 1 ? 'admin@gmail.com' :
                    i === 2 ? 'hr@gmail.com' :
                    i === 3 ? 'hrpayrollmanager@gmail.com' :
                    i === 4 ? 'hrpayrolluser@gmail.com' :
                    i === 5 ? 'employee@gmail.com' :
                    `emp${i}@peoplepay360.com`;
      const phone = `+91 98${String(10000000 + i).slice(1)}`;
      const deptId = (i % 8) + 1;
      const schedId = (i % 3) + 1;
      const desig = designations[(i - 1) % designations.length];
      const gender = i % 3 === 0 ? 'Female' : 'Male';
      
      const status = i <= 250 ? 'ACTIVE' : 'INACTIVE';
      const pipelineStage = i <= 200 ? 'ACTIVE' : (i <= 270 ? 'NEW_JOINER' : 'EXITING');

      const bankAcc = `HDFC000${String(10000 + i)}`;
      const panNum = `ABCDE${String(1000 + i)}F`;
      const uanNum = `1000${String(80000000 + i)}`;

      empValues.push([
        i, code, fName, lName, email, phone, '1992-05-15', gender, '2024-01-10', null,
        deptId, null, schedId, desig, 'FULL_TIME', status, pipelineStage, 'Bangalore HQ',
        `ID${i}`, bankAcc, panNum, uanNum, 'MG Road', 'Bangalore', 'Karnataka', 'India', '560001'
      ]);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("TRUNCATE TABLE employees;");
    await connection.query("TRUNCATE TABLE contracts;");
    await connection.query("TRUNCATE TABLE payruns;");
    await connection.query("TRUNCATE TABLE payslips;");
    await connection.query("TRUNCATE TABLE payslip_lines;");
    await connection.query("TRUNCATE TABLE attendance;");
    await connection.query("TRUNCATE TABLE leave_requests;");
    await connection.query("TRUNCATE TABLE users;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    for (const val of empValues) {
      await connection.query(`
        INSERT INTO employees (
          id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, joining_date, termination_date,
          department_id, manager_id, schedule_id, designation, employee_type, status, pipeline_stage, work_location,
          national_id, bank_account, pan_number, uan_number, address, city, state, country, postal_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, val);
    }
    console.log("✅ 300 Employees inserted.");

    console.log("📜 Generating Contracts for 200 active employees...");
    for (let i = 1; i <= 200; i++) {
      const contractNum = `CNT-2026-${String(i).padStart(3, '0')}`;
      const wage = 40000 + ((i * 750) % 90000);
      const structId = (i % 3) + 1;
      await connection.query(`
        INSERT INTO contracts (
          employee_id, contract_number, start_date, end_date, contract_type, wage, currency, pay_frequency, salary_structure_id, status
        ) VALUES (?, ?, '2024-01-10', NULL, 'Permanent', ?, 'INR', 'MONTHLY', ?, 'ACTIVE');
      `, [i, contractNum, wage, structId]);
    }

    for (let i = 201; i <= 230; i++) {
      const contractNum = `CNT-DRAFT-${String(i).padStart(3, '0')}`;
      const wage = 35000;
      await connection.query(`
        INSERT INTO contracts (
          employee_id, contract_number, start_date, end_date, contract_type, wage, currency, pay_frequency, salary_structure_id, status
        ) VALUES (?, ?, '2026-09-01', NULL, 'Probation', ?, 'INR', 'MONTHLY', 1, 'DRAFT');
      `, [i, contractNum, wage]);
    }
    console.log("✅ 230 Contracts inserted (200 Active, 30 Draft).");

    console.log("💰 Generating Payruns and Payslips for Jul 2026, Aug 2026, Sep 2026...");

    const payruns = [
      { id: 1, runNumber: 'PR-2026-07', month: 'July', year: '2026', start: '2026-07-01', end: '2026-07-31', payDate: '2026-07-31', status: 'Completed' },
      { id: 2, runNumber: 'PR-2026-08', month: 'August', year: '2026', start: '2026-08-01', end: '2026-08-31', payDate: '2026-08-31', status: 'Completed' },
      { id: 3, runNumber: 'PR-2026-09', month: 'September', year: '2026', start: '2026-09-01', end: '2026-09-30', payDate: '2026-09-30', status: 'Processing' },
    ];

    for (const pr of payruns) {
      let totalGross = 0;
      let totalDeduction = 0;
      let totalNet = 0;

      await connection.query(`
        INSERT INTO payruns (id, run_number, month, year, pay_date, salary_structure_id, period_start, period_end, status, employee_count)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, 200);
      `, [pr.id, pr.runNumber, pr.month, pr.year, pr.payDate, pr.start, pr.end, pr.status]);

      const [activeContracts] = await connection.query("SELECT c.*, e.employee_code FROM contracts c JOIN employees e ON c.employee_id = e.id WHERE c.status = 'ACTIVE';");

      for (const contract of activeContracts) {
        const wage = parseFloat(contract.wage);
        const basic = wage * 0.50;
        const hra = wage * 0.20;
        const spec = wage * 0.15;
        const conv = 2500;
        const gross = basic + hra + spec + conv;

        const pf = basic * 0.12;
        const tds = gross * 0.05;
        const pt = 200;
        const deductions = pf + tds + pt;
        const net = gross - deductions;

        totalGross += gross;
        totalDeduction += deductions;
        totalNet += net;

        const payslipNum = `SLIP-${pr.year}-${pr.month.substring(0,3).toUpperCase()}-${contract.employee_code}`;
        const slipStatus = pr.status === 'Completed' ? 'Paid' : 'Computed';
        const pmtStatus = pr.status === 'Completed' ? 'PAID' : 'UNPAID';

        const [slipResult] = await connection.query(`
          INSERT INTO payslips (
            payslip_number, payrun_id, employee_id, contract_id, salary_structure_id, period_start, period_end,
            worked_days, paid_days, gross_amount, deduction_amount, net_amount, status, payment_status
          ) VALUES (?, ?, ?, ?, 1, ?, ?, 26, 26, ?, ?, ?, ?, ?);
        `, [payslipNum, pr.id, contract.employee_id, contract.id, pr.start, pr.end, gross, deductions, net, slipStatus, pmtStatus]);

        const slipId = slipResult.insertId;

        await connection.query(`
          INSERT INTO payslip_lines (payslip_id, rule_id, rule_code, rule_name, category, amount) VALUES
          (?, 1, 'BASIC', 'Basic Salary', 'BASIC', ?),
          (?, 2, 'HRA', 'House Rent Allowance', 'ALLOWANCE', ?),
          (?, 3, 'SPEC', 'Special Allowance', 'ALLOWANCE', ?),
          (?, 4, 'CONV', 'Conveyance Allowance', 'ALLOWANCE', ?),
          (?, 5, 'PF', 'Provident Fund', 'DEDUCTION', ?),
          (?, 6, 'TDS', 'Tax Deducted at Source', 'DEDUCTION', ?),
          (?, 7, 'PT', 'Professional Tax', 'DEDUCTION', ?);
        `, [
          slipId, basic,
          slipId, hra,
          slipId, spec,
          slipId, conv,
          slipId, pf,
          slipId, tds,
          slipId, pt
        ]);
      }

      await connection.query(`
        UPDATE payruns 
        SET total_gross = ?, total_deductions = ?, total_net = ? 
        WHERE id = ?;
      `, [totalGross, totalDeduction, totalNet, pr.id]);
    }
    console.log("✅ Payruns & Payslips inserted for 200 contracted employees across 3 months.");

    console.log("📅 Generating Attendance records for 200 employees...");
    for (let i = 1; i <= 200; i++) {
      const status = (i % 15 === 0) ? 'Absent' : (i % 25 === 0) ? 'Half Day' : 'Present';
      const hours = status === 'Present' ? 9.00 : status === 'Half Day' ? 4.00 : 0.00;

      await connection.query(`
        INSERT INTO attendance (employee_id, attendance_date, check_in, check_out, worked_hours, status)
        VALUES (?, '2026-09-05', '2026-09-05 09:00:00', '2026-09-05 18:00:00', ?, ?)
        ON DUPLICATE KEY UPDATE status=VALUES(status);
      `, [i, hours, status]);
    }
    console.log("✅ Attendance records created.");

    console.log("🔑 Creating User Accounts...");
    const passwordHash = await bcrypt.hash("123456", 10);

    const userAccounts = [
      { id: "usr-admin-1", roleId: 1, empId: 1, email: "admin@gmail.com", name: "System Admin" },
      { id: "usr-hr-1", roleId: 2, empId: 2, email: "hr@gmail.com", name: "HR Manager" },
      { id: "usr-hrmgr-1", roleId: 3, empId: 3, email: "hrpayrollmanager@gmail.com", name: "HR Payroll Manager" },
      { id: "usr-hruser-1", roleId: 4, empId: 4, email: "hrpayrolluser@gmail.com", name: "HR Payroll User" },
      { id: "usr-emp-1", roleId: 5, empId: 5, email: "employee@gmail.com", name: "Employee User" },
    ];

    for (const u of userAccounts) {
      await connection.query(`
        INSERT INTO users (id, role_id, employee_id, email, password_hash, full_name, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE email=VALUES(email);
      `, [u.id, u.roleId, u.empId, u.email, passwordHash, u.name]);
    }
    console.log("✅ 5 requested login accounts created.");

    console.log("\n=======================================================");
    console.log("🎉 SUCCESS! 300 Employees dataset seeded successfully.");
    console.log("   - Total Employees:          300");
    console.log("   - Salaried/Active Contracts: 200");
    console.log("   - New Joiners / Draft:      100");
    console.log("   - Months Seeded:            July 2026, August 2026, September 2026");
    console.log("=======================================================\n");

  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    if (connection) await connection.end();
  }
}

seed300Employees();
