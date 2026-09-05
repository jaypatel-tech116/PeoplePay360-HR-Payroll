const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Clearing existing data and starting seed...');

    // Clear tables (including v2 security tables)
    await client.query(`
      TRUNCATE TABLE audit_logs, role_permissions, user_sessions, otp_verifications, registration_requests,
      payslip_warnings, payslip_lines, payslips, payrun_employees, payruns,
      salary_rules, salary_structures, attendances, time_off_requests, time_off_allocations,
      time_off_types, contracts, users, employees, working_schedule_lines, working_schedules,
      job_positions, departments, roles, companies RESTART IDENTITY CASCADE;
    `);

    // 1. Roles
    console.log('Seeding roles...');
    const roleMap = {};
    const rolesData = [
      { name: 'Employee', desc: 'Standard employee access: profile, attendance, leave balance' },
      { name: 'HR Manager', desc: 'Manage employees, contracts, schedules, leave approvals' },
      { name: 'HR Payroll User', desc: 'Create, compute and view payruns and payslips' },
      { name: 'HR Payroll Manager', desc: 'Manage salary structures, rules, finalize and pay payruns' },
      { name: 'Admin', desc: 'System administrator with full system privileges' }
    ];
    for (const r of rolesData) {
      const res = await client.query(
        'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name',
        [r.name, r.desc]
      );
      roleMap[res.rows[0].name] = res.rows[0].id;
    }

    // 1b. Default Company
    console.log('Seeding default company...');
    const companyRes = await client.query(
      `INSERT INTO companies (name, domain, is_active)
       VALUES ('PeoplePay360 Demo Corp', 'peoplepay360.com', true)
       RETURNING id`
    );
    const defaultCompanyId = companyRes.rows[0].id;

    // 2. Departments
    console.log('Seeding departments...');
    const deptRes = await client.query(`
      INSERT INTO departments (name, parent_department_id, company_id) VALUES
      ('Executive Management', NULL, ${defaultCompanyId}),
      ('Engineering', NULL, ${defaultCompanyId}),
      ('Sales & Marketing', NULL, ${defaultCompanyId}),
      ('Human Resources', NULL, ${defaultCompanyId}),
      ('Finance & Operations', NULL, ${defaultCompanyId})
      RETURNING id, name;
    `);
    const deptMap = {};
    deptRes.rows.forEach(d => { deptMap[d.name] = d.id; });

    // 3. Job Positions
    console.log('Seeding job positions...');
    const jobsData = [
      { title: 'Chief Executive Officer', dept: 'Executive Management' },
      { title: 'Engineering Director', dept: 'Engineering' },
      { title: 'Senior Full Stack Engineer', dept: 'Engineering' },
      { title: 'Backend Engineer', dept: 'Engineering' },
      { title: 'Frontend Developer', dept: 'Engineering' },
      { title: 'QA Automation Engineer', dept: 'Engineering' },
      { title: 'DevOps Specialist', dept: 'Engineering' },
      { title: 'Sales Director', dept: 'Sales & Marketing' },
      { title: 'Senior Account Executive', dept: 'Sales & Marketing' },
      { title: 'Marketing Manager', dept: 'Sales & Marketing' },
      { title: 'HR Manager', dept: 'Human Resources' },
      { title: 'HR Payroll Specialist', dept: 'Human Resources' },
      { title: 'Finance Lead', dept: 'Finance & Operations' },
      { title: 'Operations Coordinator', dept: 'Finance & Operations' }
    ];
    const jobMap = {};
    for (const j of jobsData) {
      const res = await client.query(
        'INSERT INTO job_positions (title, department_id) VALUES ($1, $2) RETURNING id, title',
        [j.title, deptMap[j.dept]]
      );
      jobMap[j.title] = res.rows[0].id;
    }

    // 4. Working Schedules & Schedule Lines
    console.log('Seeding working schedules...');
    const sched1 = await client.query(
      `INSERT INTO working_schedules (name, schedule_type, total_weekly_hours, company_id) VALUES ('Standard Full-Time (40h)', 'full_time', 40.00, ${defaultCompanyId}) RETURNING id`
    );
    const sched2 = await client.query(
      `INSERT INTO working_schedules (name, schedule_type, total_weekly_hours, company_id) VALUES ('Operations Shift (45h)', 'shift', 45.00, ${defaultCompanyId}) RETURNING id`
    );
    const sched3 = await client.query(
      `INSERT INTO working_schedules (name, schedule_type, total_weekly_hours, company_id) VALUES ('Part-Time Flexible (20h)', 'part_time', 20.00, ${defaultCompanyId}) RETURNING id`
    );

    const s1Id = sched1.rows[0].id;
    const s2Id = sched2.rows[0].id;
    const s3Id = sched3.rows[0].id;

    // Lines for Schedule 1: Mon-Fri 09:00 - 18:00 (60 min break = 8h/day * 5 = 40h)
    for (let day = 1; day <= 5; day++) {
      await client.query(
        'INSERT INTO working_schedule_lines (working_schedule_id, day_of_week, start_time, end_time, break_duration_minutes) VALUES ($1, $2, $3, $4, $5)',
        [s1Id, day, '09:00:00', '18:00:00', 60]
      );
    }
    // Lines for Schedule 2: Mon-Fri 08:30 - 18:00 (30 min break = 9h/day * 5 = 45h)
    for (let day = 1; day <= 5; day++) {
      await client.query(
        'INSERT INTO working_schedule_lines (working_schedule_id, day_of_week, start_time, end_time, break_duration_minutes) VALUES ($1, $2, $3, $4, $5)',
        [s2Id, day, '08:30:00', '18:00:00', 30]
      );
    }
    // Lines for Schedule 3: Mon-Thu 09:00 - 14:00 (0 min break = 5h/day * 4 = 20h)
    for (let day = 1; day <= 4; day++) {
      await client.query(
        'INSERT INTO working_schedule_lines (working_schedule_id, day_of_week, start_time, end_time, break_duration_minutes) VALUES ($1, $2, $3, $4, $5)',
        [s3Id, day, '09:00:00', '14:00:00', 0]
      );
    }

    // 5. Salary Structures
    console.log('Seeding salary structures...');
    const structRes1 = await client.query(
      `INSERT INTO salary_structures (name, description, active, company_id) VALUES ('Standard Corporate Salary Structure', 'Standard Indian/Global Corporate payroll rules with HRA, PF, PT, TDS', true, ${defaultCompanyId}) RETURNING id`
    );
    const structRes2 = await client.query(
      `INSERT INTO salary_structures (name, description, active, company_id) VALUES ('Executive Tech Structure', 'High allowance tech package with tech allowance and executive tax bracket', true, ${defaultCompanyId}) RETURNING id`
    );
    const struct1Id = structRes1.rows[0].id;
    const struct2Id = structRes2.rows[0].id;

    // 6. Salary Rules (Ordered strictly by sequence)
    console.log('Seeding salary rules...');
    const struct1Rules = [
      { name: 'Basic Salary', code: 'BASIC', category: 'basic', seq: 10, method: 'fixed', amt: null, pct_code: null, formula: null },
      { name: 'House Rent Allowance', code: 'HRA', category: 'allowance', seq: 20, method: 'percentage', amt: 40.00, pct_code: 'BASIC', formula: null },
      { name: 'Special Allowance', code: 'SPECIAL_ALLOW', category: 'allowance', seq: 30, method: 'fixed', amt: 5000.00, pct_code: null, formula: null },
      { name: 'Gross Salary', code: 'GROSS', category: 'gross', seq: 40, method: 'formula', amt: null, pct_code: null, formula: 'BASIC + HRA + SPECIAL_ALLOW' },
      { name: 'Provident Fund (PF)', code: 'PF', category: 'deduction', seq: 50, method: 'formula', amt: null, pct_code: null, formula: 'BASIC * 0.12' },
      { name: 'Professional Tax (PT)', code: 'PT', category: 'deduction', seq: 60, method: 'fixed', amt: 200.00, pct_code: null, formula: null },
      { name: 'Tax Deducted at Source (TDS)', code: 'TDS', category: 'deduction', seq: 70, method: 'percentage', amt: 10.00, pct_code: 'GROSS', formula: null },
      { name: 'Net Salary', code: 'NET', category: 'net', seq: 80, method: 'formula', amt: null, pct_code: null, formula: 'GROSS - PF - PT - TDS' }
    ];

    for (const r of struct1Rules) {
      await client.query(
        `INSERT INTO salary_rules (salary_structure_id, name, code, category, sequence, computation_method, amount, percentage_of_rule_code, formula, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)`,
        [struct1Id, r.name, r.code, r.category, r.seq, r.method, r.amt, r.pct_code, r.formula]
      );
    }

    const struct2Rules = [
      { name: 'Basic Salary', code: 'BASIC', category: 'basic', seq: 10, method: 'fixed', amt: null, pct_code: null, formula: null },
      { name: 'House Rent Allowance', code: 'HRA', category: 'allowance', seq: 20, method: 'percentage', amt: 50.00, pct_code: 'BASIC', formula: null },
      { name: 'Tech & Research Allowance', code: 'TECH_ALLOW', category: 'allowance', seq: 30, method: 'fixed', amt: 8000.00, pct_code: null, formula: null },
      { name: 'Gross Salary', code: 'GROSS', category: 'gross', seq: 40, method: 'formula', amt: null, pct_code: null, formula: 'BASIC + HRA + TECH_ALLOW' },
      { name: 'Provident Fund (PF)', code: 'PF', category: 'deduction', seq: 50, method: 'formula', amt: null, pct_code: null, formula: 'BASIC * 0.12' },
      { name: 'Professional Tax (PT)', code: 'PT', category: 'deduction', seq: 60, method: 'fixed', amt: 200.00, pct_code: null, formula: null },
      { name: 'Tax Deducted at Source (TDS)', code: 'TDS', category: 'deduction', seq: 70, method: 'percentage', amt: 15.00, pct_code: 'GROSS', formula: null },
      { name: 'Net Salary', code: 'NET', category: 'net', seq: 80, method: 'formula', amt: null, pct_code: null, formula: 'GROSS - PF - PT - TDS' }
    ];

    for (const r of struct2Rules) {
      await client.query(
        `INSERT INTO salary_rules (salary_structure_id, name, code, category, sequence, computation_method, amount, percentage_of_rule_code, formula, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)`,
        [struct2Id, r.name, r.code, r.category, r.seq, r.method, r.amt, r.pct_code, r.formula]
      );
    }

    // 7. Time Off Types
    console.log('Seeding time off types...');
    const totPaid = await client.query(
      `INSERT INTO time_off_types (name, unit, requires_allocation, approval_required, affects_payroll, company_id) VALUES ('Paid Annual Leave', 'days', true, true, false, ${defaultCompanyId}) RETURNING id`
    );
    const totSick = await client.query(
      `INSERT INTO time_off_types (name, unit, requires_allocation, approval_required, affects_payroll, company_id) VALUES ('Sick Leave', 'days', true, true, false, ${defaultCompanyId}) RETURNING id`
    );
    const totCasual = await client.query(
      `INSERT INTO time_off_types (name, unit, requires_allocation, approval_required, affects_payroll, company_id) VALUES ('Casual Leave', 'days', true, true, false, ${defaultCompanyId}) RETURNING id`
    );
    const totUnpaid = await client.query(
      `INSERT INTO time_off_types (name, unit, requires_allocation, approval_required, affects_payroll, company_id) VALUES ('Unpaid Leave / LOP', 'days', false, true, true, ${defaultCompanyId}) RETURNING id`
    );

    const paidLeaveId = totPaid.rows[0].id;
    const sickLeaveId = totSick.rows[0].id;
    const casualLeaveId = totCasual.rows[0].id;
    const unpaidLeaveId = totUnpaid.rows[0].id;

    // 8. Employees Master (16 employees across 4 departments with realistic hierarchy & bank details)
    console.log('Seeding employees...');
    const empRaw = [
      // 1. CEO / Admin
      {
        full_name: 'Arthur Pendelton',
        email: 'admin@peoplepay360.com',
        phone: '+91 98765 00001',
        dept: 'Executive Management',
        pos: 'Chief Executive Officer',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321001',
        ifsc: 'HDFC0001234',
        bank_verified: true,
        hire_date: '2023-01-15',
        managerIdx: null,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      // 2. HR Manager
      {
        full_name: 'Elena Rostova',
        email: 'hrmanager@peoplepay360.com',
        phone: '+91 98765 00002',
        dept: 'Human Resources',
        pos: 'HR Manager',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321002',
        ifsc: 'HDFC0001234',
        bank_verified: true,
        hire_date: '2023-03-01',
        managerIdx: 0,
        photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      // 3. HR Payroll Manager
      {
        full_name: 'Marcus Vance',
        email: 'payrollmgr@peoplepay360.com',
        phone: '+91 98765 00003',
        dept: 'Human Resources',
        pos: 'HR Payroll Specialist',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321003',
        ifsc: 'ICIC0004321',
        bank_verified: true,
        hire_date: '2023-04-10',
        managerIdx: 1,
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      // 4. HR Payroll User
      {
        full_name: 'Sarah Lin',
        email: 'payrolluser@peoplepay360.com',
        phone: '+91 98765 00004',
        dept: 'Human Resources',
        pos: 'HR Payroll Specialist',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321004',
        ifsc: 'ICIC0004321',
        bank_verified: true,
        hire_date: '2023-08-01',
        managerIdx: 2,
        photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      // 5. Engineering Director
      {
        full_name: 'Vikram Sengupta',
        email: 'vikram.sengupta@peoplepay360.com',
        phone: '+91 98765 00005',
        dept: 'Engineering',
        pos: 'Engineering Director',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321005',
        ifsc: 'SBIN0008899',
        bank_verified: true,
        hire_date: '2023-02-01',
        managerIdx: 0,
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      // 6. Senior Full Stack Engineer (Primary Employee demo account)
      {
        full_name: 'Devin Thorne',
        email: 'employee@peoplepay360.com',
        phone: '+91 98765 00006',
        dept: 'Engineering',
        pos: 'Senior Full Stack Engineer',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321006',
        ifsc: 'SBIN0008899',
        bank_verified: true,
        hire_date: '2023-05-15',
        managerIdx: 4,
        photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
      },
      // 7. Backend Engineer
      {
        full_name: 'Priya Sharma',
        email: 'priya.sharma@peoplepay360.com',
        phone: '+91 98765 00007',
        dept: 'Engineering',
        pos: 'Backend Engineer',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321007',
        ifsc: 'HDFC0001234',
        bank_verified: true,
        hire_date: '2023-06-20',
        managerIdx: 4,
        photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
      },
      // 8. Frontend Developer (Has UNVERIFIED bank details for payslip warning trigger)
      {
        full_name: 'Lucas Meyer',
        email: 'lucas.meyer@peoplepay360.com',
        phone: '+91 98765 00008',
        dept: 'Engineering',
        pos: 'Frontend Developer',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321008',
        ifsc: 'KKBK0001122',
        bank_verified: false, // unverified!
        hire_date: '2023-09-01',
        managerIdx: 4,
        photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
      },
      // 9. QA Engineer (Has MISSING bank details for payslip warning trigger)
      {
        full_name: 'Ananya Deshmukh',
        email: 'ananya.d@peoplepay360.com',
        phone: '+91 98765 00009',
        dept: 'Engineering',
        pos: 'QA Automation Engineer',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: null, // missing!
        ifsc: null,
        bank_verified: false,
        hire_date: '2023-11-01',
        managerIdx: 4,
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      },
      // 10. DevOps Specialist (Part-time)
      {
        full_name: 'Tariq Al-Mansoor',
        email: 'tariq.m@peoplepay360.com',
        phone: '+91 98765 00010',
        dept: 'Engineering',
        pos: 'DevOps Specialist',
        schedId: s3Id,
        type: 'part_time',
        status: 'active',
        bank_acc: '987654321010',
        ifsc: 'HDFC0001234',
        bank_verified: true,
        hire_date: '2024-01-10',
        managerIdx: 4,
        photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
      },
      // 11. Sales Director
      {
        full_name: 'Rachel Sterling',
        email: 'rachel.s@peoplepay360.com',
        phone: '+91 98765 00011',
        dept: 'Sales & Marketing',
        pos: 'Sales Director',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321011',
        ifsc: 'AXIS0009988',
        bank_verified: true,
        hire_date: '2023-02-15',
        managerIdx: 0,
        photo_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
      },
      // 12. Senior Account Executive (Shift schedule)
      {
        full_name: 'Carlos Mendoza',
        email: 'carlos.m@peoplepay360.com',
        phone: '+91 98765 00012',
        dept: 'Sales & Marketing',
        pos: 'Senior Account Executive',
        schedId: s2Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321012',
        ifsc: 'AXIS0009988',
        bank_verified: true,
        hire_date: '2023-07-01',
        managerIdx: 10,
        photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
      },
      // 13. Marketing Manager (Contract employee)
      {
        full_name: 'Chloe Bennett',
        email: 'chloe.b@peoplepay360.com',
        phone: '+91 98765 00013',
        dept: 'Sales & Marketing',
        pos: 'Marketing Manager',
        schedId: s1Id,
        type: 'contract',
        status: 'active',
        bank_acc: '987654321013',
        ifsc: 'ICIC0004321',
        bank_verified: true,
        hire_date: '2024-02-01',
        managerIdx: 10,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      // 14. Finance Lead
      {
        full_name: 'Jonathan Wu',
        email: 'jonathan.wu@peoplepay360.com',
        phone: '+91 98765 00014',
        dept: 'Finance & Operations',
        pos: 'Finance Lead',
        schedId: s1Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321014',
        ifsc: 'HDFC0001234',
        bank_verified: true,
        hire_date: '2023-01-20',
        managerIdx: 0,
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      },
      // 15. Operations Coordinator (Shift schedule)
      {
        full_name: 'Fatima Zahra',
        email: 'fatima.z@peoplepay360.com',
        phone: '+91 98765 00015',
        dept: 'Finance & Operations',
        pos: 'Operations Coordinator',
        schedId: s2Id,
        type: 'full_time',
        status: 'active',
        bank_acc: '987654321015',
        ifsc: 'SBIN0008899',
        bank_verified: true,
        hire_date: '2023-10-15',
        managerIdx: 13,
        photo_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80'
      },
      // 16. Engineering Intern
      {
        full_name: 'Rohan Gupta',
        email: 'rohan.g@peoplepay360.com',
        phone: '+91 98765 00016',
        dept: 'Engineering',
        pos: 'Frontend Developer',
        schedId: s3Id,
        type: 'intern',
        status: 'active',
        bank_acc: '987654321016',
        ifsc: 'KKBK0001122',
        bank_verified: true,
        hire_date: '2024-05-01',
        managerIdx: 4,
        photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
      }
    ];

    const insertedEmps = [];
    for (let i = 0; i < empRaw.length; i++) {
      const e = empRaw[i];
      const deptId = deptMap[e.dept];
      const jobId = jobMap[e.pos];
      const res = await client.query(
        `INSERT INTO employees
         (full_name, email, phone, department_id, manager_id, job_position_id, working_schedule_id, status, employee_type, bank_account_number, ifsc_code, bank_verified, hire_date, photo_url, company_id)
         VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id, full_name, email, department_id, job_position_id, working_schedule_id`,
        [e.full_name, e.email, e.phone, deptId, jobId, e.schedId, e.status, e.type, e.bank_acc, e.ifsc, e.bank_verified, e.hire_date, e.photo_url, defaultCompanyId]
      );
      insertedEmps.push(res.rows[0]);
    }

    // Update managers now that IDs exist
    for (let i = 0; i < empRaw.length; i++) {
      if (empRaw[i].managerIdx !== null) {
        const mgrId = insertedEmps[empRaw[i].managerIdx].id;
        await client.query('UPDATE employees SET manager_id = $1 WHERE id = $2', [mgrId, insertedEmps[i].id]);
      }
    }

    // 9. Users (Link to primary employees with bcrypt hashed password 'password123')
    console.log('Seeding users...');
    const pwdHash = await bcrypt.hash('password123', 10);
    const usersData = [
      { name: 'Arthur Pendelton', email: 'admin@peoplepay360.com', role: 'Admin', empId: insertedEmps[0].id },
      { name: 'Elena Rostova', email: 'hrmanager@peoplepay360.com', role: 'HR Manager', empId: insertedEmps[1].id },
      { name: 'Marcus Vance', email: 'payrollmgr@peoplepay360.com', role: 'HR Payroll Manager', empId: insertedEmps[2].id },
      { name: 'Sarah Lin', email: 'payrolluser@peoplepay360.com', role: 'HR Payroll User', empId: insertedEmps[3].id },
      { name: 'Devin Thorne', email: 'employee@peoplepay360.com', role: 'Employee', empId: insertedEmps[5].id },
      { name: 'Vikram Sengupta', email: 'vikram.sengupta@peoplepay360.com', role: 'HR Manager', empId: insertedEmps[4].id }
    ];

    for (const u of usersData) {
      const uRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role_id, employee_id, is_active, company_id, email_verified)
         VALUES ($1, $2, $3, $4, $5, true, $6, true) RETURNING id`,
        [u.name, u.email, pwdHash, roleMap[u.role], u.empId, defaultCompanyId]
      );
      // Link back employee.user_id
      await client.query('UPDATE employees SET user_id = $1 WHERE id = $2', [uRes.rows[0].id, u.empId]);
    }

    // 10. Contracts (Historical and active contracts per employee)
    console.log('Seeding contracts...');
    // Base monthly wages for employees (in currency units, e.g. INR / USD)
    const baseWages = [
      220000, 110000, 95000, 75000, 180000, 140000, 90000, 80000,
      70000, 60000, 150000, 85000, 78000, 130000, 65000, 30000
    ];

    const activeContractMap = {}; // empId -> contractId

    for (let i = 0; i < insertedEmps.length; i++) {
      const emp = insertedEmps[i];
      const wage = baseWages[i];
      const structId = (i === 0 || i === 4 || i === 5 || i === 10) ? struct2Id : struct1Id;

      // Add an expired historical contract for seasoned employees
      if (i < 8) {
        await client.query(
          `INSERT INTO contracts (employee_id, department_id, job_position_id, wage, salary_structure_id, working_schedule_id, start_date, end_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, '2024-01-01', '2024-12-31', 'expired')`,
          [emp.id, emp.department_id, emp.job_position_id, Math.round(wage * 0.85), structId, emp.working_schedule_id]
        );
      }

      // Add the active contract for 2025-2026
      const cRes = await client.query(
        `INSERT INTO contracts (employee_id, department_id, job_position_id, wage, salary_structure_id, working_schedule_id, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, '2025-01-01', NULL, 'active') RETURNING id`,
        [emp.id, emp.department_id, emp.job_position_id, wage, structId, emp.working_schedule_id]
      );
      activeContractMap[emp.id] = cRes.rows[0].id;
    }

    // 11. Time Off Allocations
    console.log('Seeding time off allocations...');
    for (const emp of insertedEmps) {
      // Annual Paid Leave: 20 days
      await client.query(
        `INSERT INTO time_off_allocations (employee_id, time_off_type_id, allocated_amount, taken_amount, remaining_amount, valid_from, valid_to, status)
         VALUES ($1, $2, 20.00, 3.00, 17.00, '2026-01-01', '2026-12-31', 'approved')`,
        [emp.id, paidLeaveId]
      );
      // Sick Leave: 10 days
      await client.query(
        `INSERT INTO time_off_allocations (employee_id, time_off_type_id, allocated_amount, taken_amount, remaining_amount, valid_from, valid_to, status)
         VALUES ($1, $2, 10.00, 1.00, 9.00, '2026-01-01', '2026-12-31', 'approved')`,
        [emp.id, sickLeaveId]
      );
      // Casual Leave: 5 days
      await client.query(
        `INSERT INTO time_off_allocations (employee_id, time_off_type_id, allocated_amount, taken_amount, remaining_amount, valid_from, valid_to, status)
         VALUES ($1, $2, 5.00, 0.00, 5.00, '2026-01-01', '2026-12-31', 'approved')`,
        [emp.id, casualLeaveId]
      );
    }

    // 12. Time Off Requests (Approved and Pending for live demo)
    console.log('Seeding time off requests...');
    // Approved requests in August 2026
    await client.query(
      `INSERT INTO time_off_requests (employee_id, time_off_type_id, date_from, date_to, duration, status, approved_by, decided_at, reason)
       VALUES ($1, $2, '2026-08-10', '2026-08-12', 3.00, 'approved', 2, '2026-08-08 10:00:00+05:30', 'Family wedding vacation')`,
      [insertedEmps[5].id, paidLeaveId]
    );
    await client.query(
      `INSERT INTO time_off_requests (employee_id, time_off_type_id, date_from, date_to, duration, status, approved_by, decided_at, reason)
       VALUES ($1, $2, '2026-08-18', '2026-08-18', 1.00, 'approved', 2, '2026-08-17 14:00:00+05:30', 'Viral fever doctor visit')`,
      [insertedEmps[6].id, sickLeaveId]
    );
    // Pending requests for Live Scenario 2 (Ready for live approval & atomic deduction demo!)
    await client.query(
      `INSERT INTO time_off_requests (employee_id, time_off_type_id, date_from, date_to, duration, status, reason)
       VALUES ($1, $2, '2026-09-10', '2026-09-12', 3.00, 'submitted', 'Annual family trip to Goa')`,
      [insertedEmps[5].id, paidLeaveId]
    );
    await client.query(
      `INSERT INTO time_off_requests (employee_id, time_off_type_id, date_from, date_to, duration, status, reason)
       VALUES ($1, $2, '2026-09-15', '2026-09-16', 2.00, 'submitted', 'Medical checkup and rest')`,
      [insertedEmps[7].id, sickLeaveId]
    );

    // 13. Attendance records (Past 3 weeks with normal, late, overtime, and a missing checkout for correction demo!)
    console.log('Seeding attendance records...');
    const days = [
      '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21',
      '2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28',
      '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'
    ];

    for (const d of days) {
      for (let i = 0; i < insertedEmps.length; i++) {
        const emp = insertedEmps[i];
        // Skip some days for variety (e.g. employee 5 was on leave Aug 10-12)
        if (i === 8 && d === '2026-09-04') {
          // Missing checkout exception for Ananya Deshmukh
          await client.query(
            `INSERT INTO attendances (employee_id, check_in, check_out, worked_hours, status)
             VALUES ($1, $2, NULL, 0.00, 'missing_checkout')`,
            [emp.id, `${d} 09:05:00+05:30`]
          );
        } else if (i === 7 && d === '2026-09-03') {
          // Late check-in for Lucas Meyer
          await client.query(
            `INSERT INTO attendances (employee_id, check_in, check_out, worked_hours, status)
             VALUES ($1, $2, $3, 7.50, 'late')`,
            [emp.id, `${d} 10:30:00+05:30`, `${d} 18:00:00+05:30`]
          );
        } else if (i === 5 && d === '2026-08-28') {
          // Overtime for Devin Thorne
          await client.query(
            `INSERT INTO attendances (employee_id, check_in, check_out, worked_hours, status)
             VALUES ($1, $2, $3, 10.50, 'overtime')`,
            [emp.id, `${d} 08:30:00+05:30`, `${d} 20:00:00+05:30`]
          );
        } else {
          // Normal 8 hour day
          await client.query(
            `INSERT INTO attendances (employee_id, check_in, check_out, worked_hours, status)
             VALUES ($1, $2, $3, 8.00, 'normal')`,
            [emp.id, `${d} 09:00:00+05:30`, `${d} 18:00:00+05:30`]
          );
        }
      }
    }

    // 14. Payruns & Historical Payslips
    console.log('Seeding historical payrun...');
    // Payrun 1: July 2026 (Paid & Finalized)
    const pr1Res = await client.query(
      `INSERT INTO payruns (name, salary_structure_id, period_start, period_end, status, created_by, total_gross, total_net, company_id)
       VALUES ('Payrun - July 2026', $1, '2026-07-01', '2026-07-31', 'paid', 3, 0.00, 0.00, $2) RETURNING id`,
      [struct1Id, defaultCompanyId]
    );
    const pr1Id = pr1Res.rows[0].id;

    // Attach first 10 employees to Payrun 1
    let totalGrossPr1 = 0;
    let totalNetPr1 = 0;

    for (let i = 0; i < 10; i++) {
      const emp = insertedEmps[i];
      await client.query(
        'INSERT INTO payrun_employees (payrun_id, employee_id) VALUES ($1, $2)',
        [pr1Id, emp.id]
      );

      const contractId = activeContractMap[emp.id];
      const baseWage = baseWages[i];
      const basic = Math.round(baseWage * 0.5);
      const hra = Math.round(basic * 0.4);
      const spAllow = 5000;
      const gross = basic + hra + spAllow;
      const pf = Math.round(basic * 0.12);
      const pt = 200;
      const tds = Math.round(gross * 0.10);
      const net = gross - pf - pt - tds;

      totalGrossPr1 += gross;
      totalNetPr1 += net;

      const psRes = await client.query(
        `INSERT INTO payslips (payrun_id, employee_id, contract_id, worked_days, status, gross_amount, net_amount, has_warnings, email_sent, email_sent_at)
         VALUES ($1, $2, $3, 22.00, 'paid', $4, $5, false, true, '2026-08-01 10:00:00+05:30') RETURNING id`,
        [pr1Id, emp.id, contractId, gross, net]
      );
      const psId = psRes.rows[0].id;

      // Lines
      const lines = [
        { code: 'BASIC', label: 'Basic Salary', cat: 'basic', seq: 10, amt: basic },
        { code: 'HRA', label: 'House Rent Allowance', cat: 'allowance', seq: 20, amt: hra },
        { code: 'SPECIAL_ALLOW', label: 'Special Allowance', cat: 'allowance', seq: 30, amt: spAllow },
        { code: 'GROSS', label: 'Gross Salary', cat: 'gross', seq: 40, amt: gross },
        { code: 'PF', label: 'Provident Fund (PF)', cat: 'deduction', seq: 50, amt: pf },
        { code: 'PT', label: 'Professional Tax (PT)', cat: 'deduction', seq: 60, amt: pt },
        { code: 'TDS', label: 'Tax Deducted at Source (TDS)', cat: 'deduction', seq: 70, amt: tds },
        { code: 'NET', label: 'Net Salary', cat: 'net', seq: 80, amt: net }
      ];

      for (const l of lines) {
        await client.query(
          `INSERT INTO payslip_lines (payslip_id, rule_code, label, category, sequence, amount)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [psId, l.code, l.label, l.cat, l.seq, l.amt]
        );
      }
    }

    await client.query(
      'UPDATE payruns SET total_gross = $1, total_net = $2 WHERE id = $3',
      [totalGrossPr1, totalNetPr1, pr1Id]
    );

    // Payrun 2: August 2026 (Draft Payrun ready for live computation / demo)
    console.log('Seeding draft payrun for live demo...');
    const pr2Res = await client.query(
      `INSERT INTO payruns (name, salary_structure_id, period_start, period_end, status, created_by, total_gross, total_net, company_id)
       VALUES ('Payrun - August 2026 (Live Demo)', $1, '2026-08-01', '2026-08-31', 'draft', 3, 0.00, 0.00, $2) RETURNING id`,
      [struct1Id, defaultCompanyId]
    );
    const pr2Id = pr2Res.rows[0].id;

    // Attach all 16 employees to Payrun 2
    for (const emp of insertedEmps) {
      await client.query(
        'INSERT INTO payrun_employees (payrun_id, employee_id) VALUES ($1, $2)',
        [pr2Id, emp.id]
      );
    }

    // 15. Seed Role Permissions
    console.log('Seeding role permissions...');
    const PERMISSION_MATRIX = {
      'Employee': [
        ['employees', 'read_own'], ['attendance', 'read_own'], ['attendance', 'create_own'],
        ['time_off', 'read_own'], ['time_off', 'create_own'],
        ['payslips', 'read_own'], ['payslips', 'download_own'],
      ],
      'HR Manager': [
        ['employees', 'read_own'], ['employees', 'read_all'], ['employees', 'create'], ['employees', 'update'],
        ['attendance', 'read_own'], ['attendance', 'read_all'], ['attendance', 'create_own'], ['attendance', 'correct'],
        ['time_off', 'read_own'], ['time_off', 'read_all'], ['time_off', 'create_own'], ['time_off', 'approve'],
        ['time_off', 'manage_types'], ['time_off', 'manage_allocations'],
        ['contracts', 'read'], ['contracts', 'create'], ['contracts', 'update'],
        ['schedules', 'read'], ['schedules', 'manage'], ['dashboard', 'read'],
      ],
      'HR Payroll User': [
        ['employees', 'read_own'], ['employees', 'read_all'], ['employees', 'create'], ['employees', 'update'],
        ['attendance', 'read_own'], ['attendance', 'read_all'], ['attendance', 'create_own'], ['attendance', 'correct'],
        ['time_off', 'read_own'], ['time_off', 'read_all'], ['time_off', 'create_own'], ['time_off', 'approve'],
        ['time_off', 'manage_types'], ['time_off', 'manage_allocations'],
        ['contracts', 'read'], ['contracts', 'create'], ['contracts', 'update'],
        ['schedules', 'read'], ['schedules', 'manage'],
        ['payslips', 'read_own'], ['payslips', 'read_all'], ['payslips', 'download_own'],
        ['payruns', 'read'], ['payruns', 'create'], ['payruns', 'compute'], ['payruns', 'validate'],
        ['salary_structures', 'read'], ['salary_rules', 'read'], ['dashboard', 'read'],
      ],
      'HR Payroll Manager': [
        ['employees', 'read_own'], ['employees', 'read_all'], ['employees', 'create'], ['employees', 'update'],
        ['attendance', 'read_own'], ['attendance', 'read_all'], ['attendance', 'create_own'], ['attendance', 'correct'],
        ['time_off', 'read_own'], ['time_off', 'read_all'], ['time_off', 'create_own'], ['time_off', 'approve'],
        ['time_off', 'manage_types'], ['time_off', 'manage_allocations'],
        ['contracts', 'read'], ['contracts', 'create'], ['contracts', 'update'],
        ['schedules', 'read'], ['schedules', 'manage'],
        ['payslips', 'read_own'], ['payslips', 'read_all'], ['payslips', 'download_own'],
        ['payruns', 'read'], ['payruns', 'create'], ['payruns', 'compute'], ['payruns', 'validate'],
        ['payruns', 'mark_paid'], ['payruns', 'delete'],
        ['salary_structures', 'read'], ['salary_structures', 'manage'],
        ['salary_rules', 'read'], ['salary_rules', 'manage'], ['dashboard', 'read'],
      ],
      'Admin': [
        ['employees', 'read_own'], ['employees', 'read_all'], ['employees', 'create'], ['employees', 'update'], ['employees', 'delete'],
        ['attendance', 'read_own'], ['attendance', 'read_all'], ['attendance', 'create_own'], ['attendance', 'correct'],
        ['time_off', 'read_own'], ['time_off', 'read_all'], ['time_off', 'create_own'], ['time_off', 'approve'],
        ['time_off', 'manage_types'], ['time_off', 'manage_allocations'],
        ['contracts', 'read'], ['contracts', 'create'], ['contracts', 'update'], ['contracts', 'delete'],
        ['schedules', 'read'], ['schedules', 'manage'],
        ['payslips', 'read_own'], ['payslips', 'read_all'], ['payslips', 'download_own'],
        ['payruns', 'read'], ['payruns', 'create'], ['payruns', 'compute'], ['payruns', 'validate'],
        ['payruns', 'mark_paid'], ['payruns', 'delete'],
        ['salary_structures', 'read'], ['salary_structures', 'manage'],
        ['salary_rules', 'read'], ['salary_rules', 'manage'],
        ['users', 'read'], ['users', 'manage'],
        ['companies', 'manage'], ['audit_logs', 'read'], ['dashboard', 'read'],
      ]
    };

    for (const [roleName, permissions] of Object.entries(PERMISSION_MATRIX)) {
      const roleId = roleMap[roleName];
      if (!roleId) continue;
      for (const [module, action] of permissions) {
        await client.query(
          `INSERT INTO role_permissions (role_id, module, action) VALUES ($1, $2, $3)
           ON CONFLICT (role_id, module, action) DO NOTHING`,
          [roleId, module, action]
        );
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Seed completed successfully!');
    console.log(`Company: PeoplePay360 Demo Corp (ID: ${defaultCompanyId})`);
    console.log('Summary of demo accounts (Password for all: password123):');
    console.log('  Admin:               admin@peoplepay360.com');
    console.log('  HR Manager:          hrmanager@peoplepay360.com');
    console.log('  HR Payroll Manager:  payrollmgr@peoplepay360.com');
    console.log('  HR Payroll User:     payrolluser@peoplepay360.com');
    console.log('  Employee:            employee@peoplepay360.com');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
