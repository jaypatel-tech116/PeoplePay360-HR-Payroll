const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../src/config/db");

/**
 * Script to initialize and seed the PeoplePay360 database schema.
 * Recreates all 16 tables, baseline metadata, and static accounts:
 * 1) employee1@gmail.com / 123456  (Role: EMPLOYEE)
 * 2) hr@gmail.com / 909090         (Role: HR_MANAGER)
 */
async function initDb() {
  console.log("🚀 Initializing PeoplePay360 Database Schema (16 Tables)...");

  try {
    // 1. Read and execute complete schema DDL
    const schemaPath = path.join(__dirname, "../src/config/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");
    await pool.query(sql);
    console.log("✅ 16 tables created successfully with foreign keys and indexes.");

    // 2. Seed Baseline Master Data
    console.log("🌱 Seeding baseline departments, schedules, and leave types...");
    
    // Departments
    await pool.query(`
      INSERT INTO public.departments (name, code, description)
      VALUES 
        ('Human Resources', 'HR', 'People Operations & Talent Management'),
        ('Engineering', 'ENG', 'Product Development & Software Engineering'),
        ('Finance', 'FIN', 'Payroll, Accounting & Financial Operations'),
        ('Operations', 'OPS', 'Day-to-day Business Operations')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Working Schedules
    const scheduleRes = await pool.query(`
      INSERT INTO public.working_schedules (
        name, code, monday_start, monday_end, tuesday_start, tuesday_end,
        wednesday_start, wednesday_end, thursday_start, thursday_end,
        friday_start, friday_end, break_minutes, weekly_hours
      )
      VALUES (
        'Standard Full-Time (40h)', 'STD_40',
        '09:00:00', '18:00:00', '09:00:00', '18:00:00',
        '09:00:00', '18:00:00', '09:00:00', '18:00:00',
        '09:00:00', '18:00:00', 60, 40.00
      )
      ON CONFLICT (name) DO UPDATE SET is_active = true
      RETURNING id;
    `);
    const defaultScheduleId = scheduleRes.rows[0]?.id;

    // Leave Types
    await pool.query(`
      INSERT INTO public.leave_types (code, name, unit, requires_allocation, is_paid, affects_payroll, requires_approval)
      VALUES
        ('ANNUAL', 'Annual Paid Leave', 'DAYS', true, true, false, true),
        ('SICK', 'Sick Leave', 'DAYS', true, true, false, true),
        ('CASUAL', 'Casual Leave', 'DAYS', true, true, false, true),
        ('UNPAID', 'Unpaid Leave', 'DAYS', false, false, true, true)
      ON CONFLICT (code) DO NOTHING;
    `);

    // Salary Structure
    const structRes = await pool.query(`
      INSERT INTO public.salary_structures (code, name, description)
      VALUES ('REGULAR_MONTHLY', 'Standard Monthly Salaried Structure', 'Full-time employee regular pay schedule')
      ON CONFLICT (code) DO UPDATE SET is_active = true
      RETURNING id;
    `);
    const defaultStructureId = structRes.rows[0]?.id;

    // Salary Rules
    if (defaultStructureId) {
      await pool.query(`
        INSERT INTO public.salary_rules (salary_structure_id, code, name, category, sequence, calculation_type, fixed_amount, percentage, formula)
        VALUES
          ($1, 'BASIC', 'Basic Salary', 'BASIC', 1, 'FIXED', 50000.00, NULL, NULL),
          ($1, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 'PERCENTAGE', NULL, 20.00, 'BASIC * 0.20'),
          ($1, 'GROSS', 'Gross Salary', 'GROSS', 3, 'FORMULA', NULL, NULL, 'BASIC + HRA'),
          ($1, 'PF', 'Provident Fund', 'DEDUCTION', 4, 'PERCENTAGE', NULL, 12.00, 'BASIC * 0.12'),
          ($1, 'NET', 'Net Take Home Salary', 'NET', 5, 'FORMULA', NULL, NULL, 'GROSS - PF')
        ON CONFLICT (code) DO NOTHING;
      `, [defaultStructureId]);
    }

    // 3. Fetch Role IDs
    const rolesRes = await pool.query(`SELECT id, code FROM public.roles;`);
    const roleMap = {};
    rolesRes.rows.forEach((r) => {
      roleMap[r.code] = r.id;
    });

    const hrDeptRes = await pool.query(`SELECT id FROM public.departments WHERE code = 'HR' LIMIT 1;`);
    const engDeptRes = await pool.query(`SELECT id FROM public.departments WHERE code = 'ENG' LIMIT 1;`);
    const hrDeptId = hrDeptRes.rows[0]?.id;
    const engDeptId = engDeptRes.rows[0]?.id;

    // 4. Seed Employee 1: employee1@gmail.com / 123456 (Role: EMPLOYEE)
    console.log("👤 Creating static user: employee1@gmail.com / 123456 (EMPLOYEE)...");
    const emp1PassHash = await bcrypt.hash("123456", 10);
    let emp1AuthId;

    const existingEmp1Auth = await pool.query(`SELECT id FROM auth.users WHERE email = 'employee1@gmail.com';`);
    if (existingEmp1Auth.rows.length > 0) {
      emp1AuthId = existingEmp1Auth.rows[0].id;
      await pool.query(
        `UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2`,
        [emp1PassHash, emp1AuthId]
      );
    } else {
      emp1AuthId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO auth.users (
          id, aud, role, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          $1, 'authenticated', 'authenticated', 'employee1@gmail.com', $2, now(),
          '{"provider":"email","providers":["email"]}', '{"name":"Employee One"}', now(), now()
        );
      `, [emp1AuthId, emp1PassHash]);
    }

    // Insert Employee record for Employee 1
    const emp1RecordRes = await pool.query(`
      INSERT INTO public.employees (
        employee_code, first_name, last_name, email, phone,
        joining_date, department_id, schedule_id, designation,
        employee_type, status, city, country
      ) VALUES (
        'EMP001', 'Employee', 'One', 'employee1@gmail.com', '+91 9876543210',
        '2025-01-01', $1, $2, 'Software Engineer',
        'FULL_TIME', 'ACTIVE', 'Bangalore', 'India'
      )
      ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'
      RETURNING id;
    `, [engDeptId, defaultScheduleId]);
    const emp1Id = emp1RecordRes.rows[0]?.id;

    // Insert into public.users
    await pool.query(`
      INSERT INTO public.users (id, role_id, employee_id, email, full_name, is_active)
      VALUES ($1, $2, $3, 'employee1@gmail.com', 'Employee One', true)
      ON CONFLICT (id) DO UPDATE SET role_id = $2, employee_id = $3;
    `, [emp1AuthId, roleMap['EMPLOYEE'], emp1Id]);

    // Create contract for Employee 1
    if (emp1Id && defaultStructureId) {
      await pool.query(`
        INSERT INTO public.contracts (
          employee_id, contract_number, start_date, employment_type,
          wage, currency, pay_frequency, salary_structure_id, status
        ) VALUES (
          $1, 'CNT-EMP001', '2025-01-01', 'FULL_TIME',
          65000.00, 'INR', 'MONTHLY', $2, 'ACTIVE'
        )
        ON CONFLICT (contract_number) DO NOTHING;
      `, [emp1Id, defaultStructureId]);
    }

    // 5. Seed HR User: hr@gmail.com / 909090 (Role: HR_MANAGER)
    console.log("👤 Creating static user: hr@gmail.com / 909090 (HR_MANAGER)...");
    const hrPassHash = await bcrypt.hash("909090", 10);
    let hrAuthId;

    const existingHrAuth = await pool.query(`SELECT id FROM auth.users WHERE email = 'hr@gmail.com';`);
    if (existingHrAuth.rows.length > 0) {
      hrAuthId = existingHrAuth.rows[0].id;
      await pool.query(
        `UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2`,
        [hrPassHash, hrAuthId]
      );
    } else {
      hrAuthId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO auth.users (
          id, aud, role, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          $1, 'authenticated', 'authenticated', 'hr@gmail.com', $2, now(),
          '{"provider":"email","providers":["email"]}', '{"name":"HR Manager"}', now(), now()
        );
      `, [hrAuthId, hrPassHash]);
    }

    // Insert Employee record for HR
    const hrRecordRes = await pool.query(`
      INSERT INTO public.employees (
        employee_code, first_name, last_name, email, phone,
        joining_date, department_id, schedule_id, designation,
        employee_type, status, city, country
      ) VALUES (
        'HR001', 'HR', 'Manager', 'hr@gmail.com', '+91 9123456780',
        '2024-06-01', $1, $2, 'HR Operations Lead',
        'FULL_TIME', 'ACTIVE', 'Mumbai', 'India'
      )
      ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'
      RETURNING id;
    `, [hrDeptId, defaultScheduleId]);
    const hrEmpId = hrRecordRes.rows[0]?.id;

    // Insert into public.users
    await pool.query(`
      INSERT INTO public.users (id, role_id, employee_id, email, full_name, is_active)
      VALUES ($1, $2, $3, 'hr@gmail.com', 'HR Manager', true)
      ON CONFLICT (id) DO UPDATE SET role_id = $2, employee_id = $3;
    `, [hrAuthId, roleMap['HR_MANAGER'], hrEmpId]);

    // Create contract for HR
    if (hrEmpId && defaultStructureId) {
      await pool.query(`
        INSERT INTO public.contracts (
          employee_id, contract_number, start_date, employment_type,
          wage, currency, pay_frequency, salary_structure_id, status
        ) VALUES (
          $1, 'CNT-HR001', '2024-06-01', 'FULL_TIME',
          85000.00, 'INR', 'MONTHLY', $2, 'ACTIVE'
        )
        ON CONFLICT (contract_number) DO NOTHING;
      `, [hrEmpId, defaultStructureId]);
    }

    console.log("🎉 Database initialization and static seed completed successfully!");
    console.log("-----------------------------------------------------------------");
    console.log("🔑 Static Account 1: employee1@gmail.com / 123456 (Role: EMPLOYEE)");
    console.log("🔑 Static Account 2: hr@gmail.com        / 909090 (Role: HR_MANAGER)");
    console.log("-----------------------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
