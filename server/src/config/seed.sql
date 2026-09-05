-- ============================================================================
-- PeoplePay360 - PostgreSQL Seed & Test Dataset (16 Tables)
-- Exact match to all 16 UI Screens (Rahul Sharma, Priya Mehta, Vikram Rao, etc.)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 01. Seed Roles
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, code, name, description, is_active) VALUES
(1, 'ADMIN', 'Administrator', 'Full platform administration and system governance', true),
(2, 'HR_MANAGER', 'HR Manager', 'HR master data, employee onboarding, leaves, and attendance', true),
(3, 'HR_PAYROLL_MANAGER', 'HR Payroll Manager', 'Full payroll cycle execution, structure governance, and disbursement', true),
(4, 'HR_PAYROLL_USER', 'HR Payroll User', 'Operational payroll execution and payslip processing', true),
(5, 'EMPLOYEE', 'Employee', 'Self-service portal, view payslips, and apply for leaves', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- ----------------------------------------------------------------------------
-- 02. Seed Departments
-- ----------------------------------------------------------------------------
INSERT INTO departments (id, name, code, description, is_active) VALUES
(1, 'Engineering', 'ENG', 'Product development and engineering team', true),
(2, 'HR', 'HR', 'Human resources and people operations', true),
(3, 'Sales', 'SAL', 'Sales and business development', true),
(4, 'Marketing', 'MKT', 'Marketing and communications', true),
(5, 'Product', 'PROD', 'Product design and UI/UX management', true),
(6, 'Finance', 'FIN', 'Finance, treasury, and accounting', true),
(7, 'Operations', 'OPS', 'Day-to-day operations and customer support', true),
(8, 'IT', 'IT', 'IT infrastructure, systems, and security', true)
ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;

-- ----------------------------------------------------------------------------
-- 03. Seed Working Schedules
-- ----------------------------------------------------------------------------
INSERT INTO working_schedules (id, name, code, monday_start, monday_end, break_minutes, weekly_hours, description, is_active) VALUES
(1, 'Standard (9-6)', 'STD_9_6', '09:00:00', '18:00:00', 60, 40.00, 'Default full time schedule (Mon-Fri 9:00 AM - 6:00 PM)', true),
(2, 'Flexible', 'FLEX_10_7', '10:00:00', '19:00:00', 60, 40.00, 'Flexible working hours (Mon-Fri 10:00 AM - 7:00 PM)', true),
(3, 'Part Time', 'PART_TIME', '09:00:00', '13:00:00', 0, 20.00, 'Part time schedule (Mon-Fri 9:00 AM - 1:00 PM)', true),
(4, 'Shift A', 'SHIFT_A', '06:00:00', '14:00:00', 30, 45.00, 'Morning shift (Mon-Sat 6:00 AM - 2:00 PM)', true),
(5, 'Shift B', 'SHIFT_B', '14:00:00', '22:00:00', 30, 45.00, 'Evening shift (Mon-Sat 2:00 PM - 10:00 PM)', true),
(6, 'Shift C', 'SHIFT_C', '22:00:00', '06:00:00', 30, 45.00, 'Night shift (Mon-Sat 10:00 PM - 6:00 AM)', true)
ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;

-- ----------------------------------------------------------------------------
-- 04. Seed Employees (Matches EMP001 to EMP008 across all UI screens)
-- ----------------------------------------------------------------------------
INSERT INTO employees (
  id, employee_code, first_name, last_name, email, phone, date_of_birth,
  gender, joining_date, department_id, schedule_id, designation,
  employee_type, status, work_location, national_id, bank_account,
  pan_number, uan_number, address, city, state, country
) VALUES
(1, 'EMP001', 'Rahul', 'Sharma', 'rahul@company.com', '+91 98765 43210', '1995-01-12', 'Male', '2023-09-01', 1, 1, 'Software Developer', 'FULL_TIME', 'ACTIVE', 'Bangalore Office', 'XXXX1234', 'HDFC **** 4321', 'ABCDE1234F', '100012345678', 'Indiranagar', 'Bangalore', 'Karnataka', 'India'),
(2, 'EMP002', 'Priya', 'Mehta', 'priya@company.com', '+91 98765 43211', '1994-04-24', 'Female', '2022-06-15', 2, 1, 'HR Manager', 'FULL_TIME', 'ACTIVE', 'Mumbai Office', 'XXXX5678', 'ICICI **** 8765', 'BCDEF2345G', '100023456789', 'Andheri West', 'Mumbai', 'Maharashtra', 'India'),
(3, 'EMP003', 'Vikram', 'Rao', 'vikram@company.com', '+91 98765 43212', '1992-08-18', 'Male', '2023-01-10', 3, 1, 'Sales Executive', 'FULL_TIME', 'ACTIVE', 'Delhi Office', 'XXXX9012', 'SBI **** 1234', 'CDEFG3456H', '100034567890', 'Connaught Place', 'New Delhi', 'Delhi', 'India'),
(4, 'EMP004', 'Sneha', 'Iyer', 'sneha@company.com', '+91 98765 43213', '1996-11-05', 'Female', '2024-03-01', 5, 1, 'UI/UX Designer', 'FULL_TIME', 'ACTIVE', 'Bangalore Office', 'XXXX3456', 'Axis **** 6543', 'DEFGH4567I', '100045678901', 'Koramangala', 'Bangalore', 'Karnataka', 'India'),
(5, 'EMP005', 'Aditya', 'Gupta', 'aditya@company.com', '+91 98765 43214', '1993-07-14', 'Male', '2024-02-20', 1, 1, 'DevOps Engineer', 'FULL_TIME', 'ACTIVE', 'Bangalore Office', 'XXXX7890', 'HDFC **** 7890', 'EFGHI5678J', '100056789012', 'Whitefield', 'Bangalore', 'Karnataka', 'India'),
(6, 'EMP006', 'Neha', 'Patel', 'neha@company.com', '+91 98765 43215', '1997-09-30', 'Female', '2023-09-15', 2, 1, 'HR Executive', 'FULL_TIME', 'ACTIVE', 'Mumbai Office', 'XXXX2345', 'Kotak **** 4321', 'FGHIJ6789K', '100067890123', 'Bandra', 'Mumbai', 'Maharashtra', 'India'),
(7, 'EMP007', 'Rohan', 'Desai', 'rohan@company.com', '+91 98765 43216', '1991-12-02', 'Male', '2022-10-01', 4, 1, 'Marketing Specialist', 'FULL_TIME', 'INACTIVE', 'Bangalore Office', 'XXXX6789', 'ICICI **** 9012', 'GHIJK7890L', '100078901234', 'Jayanagar', 'Bangalore', 'Karnataka', 'India'),
(8, 'EMP008', 'Meera', 'Nair', 'meera@company.com', '+91 98765 43217', '1994-03-22', 'Female', '2024-01-15', 6, 1, 'Accountant', 'FULL_TIME', 'ACTIVE', 'Bangalore Office', 'XXXX0123', 'Federal **** 5678', 'HIJKL8901M', '100089012345', 'MG Road', 'Bangalore', 'Karnataka', 'India')
ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name;

-- ----------------------------------------------------------------------------
-- 05. Seed Users (Bcrypt hash for password "123456")
-- ----------------------------------------------------------------------------
INSERT INTO users (id, role_id, employee_id, email, password_hash, full_name, is_active, last_login_at) VALUES
('usr-admin-001', 1, NULL, 'admin@company.com', '$2b$10$aNJhxODeizUeOZ5Xd2duze4r.vjxEbV7UFOBetssBOKA1plonDy7.', 'System Administrator', true, '2025-08-26 10:24:00+00'),
('usr-admin-002', 1, NULL, 'admin@gmail.com', '$2b$10$aNJhxODeizUeOZ5Xd2duze4r.vjxEbV7UFOBetssBOKA1plonDy7.', 'Administrator', true, '2025-08-26 10:24:00+00'),
('usr-hr-001', 2, 2, 'hr@gmail.com', '$2b$10$oOXTMorlkrVyw02njMyiUOZEpkQvrUcwCL1GV44i5WFpJMFKRFwX.', 'Priya Mehta (HR Lead)', true, '2025-08-26 09:15:00+00'),
('usr-paymgr-001', 3, NULL, 'payroll_mgr@gmail.com', '$2b$10$7ZX.Rpl.lnxM9kSp4Hz/GOvTZfP5S.TVsqO7CEGSAg9s4w5ggoeBy', 'HR Payroll Manager', true, '2025-08-27 11:30:00+00'),
('usr-paymgr-002', 3, NULL, 'payroll@gmail.com', '$2b$10$7ZX.Rpl.lnxM9kSp4Hz/GOvTZfP5S.TVsqO7CEGSAg9s4w5ggoeBy', 'Payroll Manager', true, '2025-08-27 11:30:00+00'),
('usr-payusr-001', 4, 6, 'neha@company.com', '$2b$10$lWuBaEz1OmyJmN2T..7Jzu6lK.4dGE28AdDuGx7oG3SGgVy6hzOES', 'Neha Patel (Payroll User)', true, '2025-08-25 16:32:00+00'),
('usr-payusr-002', 4, NULL, 'payuser@gmail.com', '$2b$10$lWuBaEz1OmyJmN2T..7Jzu6lK.4dGE28AdDuGx7oG3SGgVy6hzOES', 'Payroll Operator', true, '2025-08-25 16:32:00+00'),
('usr-emp-001', 5, 1, 'employee1@gmail.com', '$2b$10$E84t9oYirfClgo0NL3FP1.WtF.M//EKUlVueErJOW8TjmRoFXMQkG', 'Rahul Sharma', true, '2025-08-28 08:45:00+00'),
('usr-emp-002', 5, NULL, 'employee@gmail.com', '$2b$10$E84t9oYirfClgo0NL3FP1.WtF.M//EKUlVueErJOW8TjmRoFXMQkG', 'Rahul Sharma', true, '2025-08-28 08:45:00+00')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ----------------------------------------------------------------------------
-- 06. Seed Salary Structures (Screen 13)
-- ----------------------------------------------------------------------------
INSERT INTO salary_structures (id, code, name, description, type, is_active) VALUES
(1, 'SS001', 'Default Structure (Full Time)', 'Standard salary structure for full time employees', 'FT', true),
(2, 'SS002', 'Part Time Structure', 'For part time employees', 'PT', true),
(3, 'SS003', 'Contract Structure', 'For contract employees', 'Contract', true),
(4, 'SS004', 'Intern Structure', 'For interns and trainees', 'Intern', true),
(5, 'SS005', 'Management Structure', 'For management level employees', 'FT', true),
(6, 'SS006', 'Sales Structure', 'For sales team with incentive components', 'FT', true),
(7, 'SS007', 'Technical Structure', 'For technical engineering team', 'FT', false),
(8, 'SS008', 'Custom Structure', 'Custom structure for special contractor roles', 'Contract', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- ----------------------------------------------------------------------------
-- 07. Seed Contracts (Screen 5)
-- ----------------------------------------------------------------------------
INSERT INTO contracts (
  id, employee_id, contract_number, start_date, end_date,
  contract_type, wage, currency, pay_frequency, salary_structure_id, status
) VALUES
(1, 1, 'CNT-EMP001', '2023-01-01', NULL, 'Permanent', 56000.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(2, 2, 'CNT-EMP002', '2023-08-15', NULL, 'Permanent', 48500.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(3, 3, 'CNT-EMP003', '2023-06-01', '2025-05-31', 'Fixed Term', 61000.00, 'INR', 'MONTHLY', 6, 'ACTIVE'),
(4, 4, 'CNT-EMP004', '2023-08-01', NULL, 'Permanent', 49000.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(5, 5, 'CNT-EMP005', '2025-07-01', '2025-12-31', 'Probation', 58000.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(6, 6, 'CNT-EMP006', '2023-09-01', '2026-08-31', 'Fixed Term', 39800.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(7, 7, 'CNT-EMP007', '2023-03-01', NULL, 'Permanent', 47500.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(8, 8, 'CNT-EMP008', '2024-01-01', '2024-12-31', 'Contract', 50000.00, 'INR', 'MONTHLY', 3, 'EXPIRED')
ON CONFLICT (contract_number) DO UPDATE SET wage = EXCLUDED.wage;

-- ----------------------------------------------------------------------------
-- 08. Seed Attendance Records (Screen 7)
-- ----------------------------------------------------------------------------
INSERT INTO attendance (id, employee_id, attendance_date, check_in, check_out, worked_hours, status) VALUES
(1, 1, '2025-08-26', '2025-08-26 09:00:00+00', '2025-08-26 18:05:00+00', 9.08, 'Present'),
(2, 2, '2025-08-26', '2025-08-26 09:15:00+00', '2025-08-26 18:00:00+00', 8.75, 'Present'),
(3, 3, '2025-08-26', NULL, NULL, 0.00, 'Absent'),
(4, 4, '2025-08-26', '2025-08-26 09:30:00+00', '2025-08-26 13:30:00+00', 4.00, 'Half Day'),
(5, 5, '2025-08-26', '2025-08-26 09:00:00+00', '2025-08-26 18:00:00+00', 9.00, 'Present'),
(6, 6, '2025-08-26', NULL, NULL, 0.00, 'On Leave'),
(7, 7, '2025-08-26', '2025-08-26 09:05:00+00', '2025-08-26 18:10:00+00', 9.08, 'Present'),
(8, 8, '2025-08-26', '2025-08-26 09:10:00+00', '2025-08-26 18:00:00+00', 8.83, 'Present')
ON CONFLICT (employee_id, attendance_date) DO UPDATE SET status = EXCLUDED.status;

-- ----------------------------------------------------------------------------
-- 09. Seed Leave Types (Screen 8)
-- ----------------------------------------------------------------------------
INSERT INTO leave_types (id, code, name, unit, requires_allocation, is_paid, affects_payroll, requires_approval) VALUES
(1, 'ANNUAL', 'Annual Leave', 'DAYS', true, true, false, true),
(2, 'SICK', 'Sick Leave', 'DAYS', true, true, false, true),
(3, 'CASUAL', 'Casual Leave', 'DAYS', true, true, false, true),
(4, 'MATERNITY', 'Maternity Leave', 'DAYS', true, true, false, true),
(5, 'PATERNITY', 'Paternity Leave', 'DAYS', true, true, false, true),
(6, 'UNPAID', 'Unpaid Leave / LOP', 'DAYS', false, false, true, true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- ----------------------------------------------------------------------------
-- 10. Seed Leave Allocations
-- ----------------------------------------------------------------------------
INSERT INTO leave_allocations (id, employee_id, leave_type_id, start_date, end_date, total_days, used_days, status) VALUES
(1, 1, 1, '2025-01-01', '2025-12-31', 18.00, 5.00, 'APPROVED'),
(2, 1, 2, '2025-01-01', '2025-12-31', 12.00, 2.00, 'APPROVED'),
(3, 1, 3, '2025-01-01', '2025-12-31', 7.00, 1.00, 'APPROVED'),
(4, 2, 1, '2025-01-01', '2025-12-31', 18.00, 4.00, 'APPROVED'),
(5, 3, 1, '2025-01-01', '2025-12-31', 18.00, 6.00, 'APPROVED'),
(6, 4, 1, '2025-01-01', '2025-12-31', 18.00, 2.00, 'APPROVED'),
(7, 5, 1, '2025-01-01', '2025-12-31', 18.00, 0.00, 'APPROVED'),
(8, 6, 1, '2025-01-01', '2025-12-31', 18.00, 3.00, 'APPROVED')
ON CONFLICT (id) DO UPDATE SET total_days = EXCLUDED.total_days;

-- ----------------------------------------------------------------------------
-- 11. Seed Leave Requests (Screen 8)
-- ----------------------------------------------------------------------------
INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days, reason, status, approved_by, approved_at) VALUES
(1, 1, 1, '2025-09-01', '2025-09-03', 3.00, 'Family vacation to Goa', 'Pending', NULL, NULL),
(2, 2, 2, '2025-08-20', '2025-08-21', 2.00, 'Viral fever recovery', 'Approved', 'usr-admin-001', '2025-08-19 14:30:00+00'),
(3, 3, 3, '2025-08-26', '2025-08-26', 1.00, 'Personal work at bank', 'Approved', 'usr-admin-001', '2025-08-25 10:00:00+00'),
(4, 4, 1, '2025-09-10', '2025-09-12', 3.00, 'Sister wedding ceremony', 'Pending', NULL, NULL),
(5, 6, 1, '2025-08-26', '2025-08-27', 2.00, 'Attending family function in Ahmedabad', 'Approved', 'usr-admin-001', '2025-08-24 16:00:00+00'),
(6, 5, 2, '2025-08-15', '2025-08-16', 2.00, 'Dental surgery and rest', 'Rejected', 'usr-admin-001', '2025-08-14 11:20:00+00')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- ----------------------------------------------------------------------------
-- 12. Seed Salary Rules (Screen 14)
-- ----------------------------------------------------------------------------
INSERT INTO salary_rules (
  id, salary_structure_id, code, name, category, sequence,
  calculation_type, fixed_amount, percentage, formula, default_value, is_active
) VALUES
(1, 1, 'BASIC', 'Basic Salary', 'BASIC', 1, 'PERCENTAGE', NULL, 50.00, 'wage * 0.50', '50% of Wage', true),
(2, 1, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 'PERCENTAGE', NULL, 20.00, 'wage * 0.20', '20% of Wage', true),
(3, 1, 'SPECIAL', 'Special Allowance', 'ALLOWANCE', 3, 'PERCENTAGE', NULL, 15.00, 'wage * 0.15', '15% of Wage', true),
(4, 1, 'CONVEYANCE', 'Conveyance Allowance', 'ALLOWANCE', 4, 'FIXED', 1600.00, NULL, '1600', 'Fixed ₹1,600', true),
(5, 1, 'MEDICAL', 'Medical Allowance', 'ALLOWANCE', 5, 'FIXED', 1250.00, NULL, '1250', 'Fixed ₹1,250', true),
(6, 1, 'GROSS', 'Gross Salary', 'GROSS', 6, 'FORMULA', NULL, NULL, 'BASIC + HRA + SPECIAL + CONVEYANCE + MEDICAL', 'Sum of Earnings', true),
(7, 1, 'PF_EMP', 'Provident Fund (Employee)', 'DEDUCTION', 7, 'PERCENTAGE', NULL, 12.00, 'BASIC * 0.12', '12% of Basic', true),
(8, 1, 'PT', 'Professional Tax', 'DEDUCTION', 8, 'FIXED', 200.00, NULL, '200', '₹200 Standard', true),
(9, 1, 'TDS', 'Tax Deducted at Source', 'DEDUCTION', 9, 'PERCENTAGE', NULL, 5.00, 'GROSS * 0.05', '5% of Gross', true),
(10, 1, 'TOTAL_DED', 'Total Deductions', 'DEDUCTION', 10, 'FORMULA', NULL, NULL, 'PF_EMP + PT + TDS', 'Sum of Deductions', true),
(11, 1, 'NET', 'Net Salary', 'NET', 11, 'FORMULA', NULL, NULL, 'GROSS - TOTAL_DED', 'Gross - Deductions', true),
(12, 1, 'PF_COMP', 'Provident Fund (Employer)', 'CONTRIBUTION', 12, 'PERCENTAGE', NULL, 12.00, 'BASIC * 0.12', '12% of Basic', true),
(13, 1, 'ESIC_COMP', 'ESIC (Employer)', 'CONTRIBUTION', 13, 'PERCENTAGE', NULL, 3.25, 'GROSS * 0.0325', '3.25% of Gross', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- ----------------------------------------------------------------------------
-- 13. Seed Payruns / Pay Cycles (Screen 9 & 10)
-- ----------------------------------------------------------------------------
INSERT INTO payruns (
  id, run_number, month, year, pay_date, salary_structure_id,
  period_start, period_end, status, employee_count,
  total_gross, total_deductions, total_net, created_by,
  computed_at, validated_at, paid_at
) VALUES
(1, 'PR-2025-08', 'August', '2025', '2025-08-31', 1, '2025-08-01', '2025-08-31', 'Processing', 8, 410800.00, 48200.00, 362600.00, 'usr-paymgr-001', '2025-08-25 18:00:00+00', NULL, NULL),
(2, 'PR-2025-07', 'July', '2025', '2025-07-31', 1, '2025-07-01', '2025-07-31', 'Completed', 8, 410800.00, 48200.00, 362600.00, 'usr-paymgr-001', '2025-07-25 18:00:00+00', '2025-07-28 10:00:00+00', '2025-07-31 16:00:00+00'),
(3, 'PR-2025-06', 'June', '2025', '2025-06-30', 1, '2025-06-01', '2025-06-30', 'Completed', 8, 405000.00, 47500.00, 357500.00, 'usr-paymgr-001', '2025-06-25 18:00:00+00', '2025-06-28 10:00:00+00', '2025-06-30 16:00:00+00')
ON CONFLICT (run_number) DO UPDATE SET total_net = EXCLUDED.total_net;

-- ----------------------------------------------------------------------------
-- 14. Seed Payslips (Screen 11)
-- ----------------------------------------------------------------------------
INSERT INTO payslips (
  id, payslip_number, payrun_id, employee_id, contract_id,
  salary_structure_id, period_start, period_end,
  worked_days, paid_days, gross_amount, deduction_amount, net_amount,
  status, payment_status
) VALUES
(1, 'SLIP-202508-EMP001', 1, 1, 1, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 56000.00, 6520.00, 49480.00, 'Computed', 'UNPAID'),
(2, 'SLIP-202508-EMP002', 1, 2, 2, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 48500.00, 5650.00, 42850.00, 'Computed', 'UNPAID'),
(3, 'SLIP-202508-EMP003', 1, 3, 3, 1, '2025-08-01', '2025-08-31', 25.00, 25.00, 61000.00, 7120.00, 53880.00, 'Computed', 'UNPAID'),
(4, 'SLIP-202508-EMP004', 1, 4, 4, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 49000.00, 5710.00, 43290.00, 'Computed', 'UNPAID'),
(5, 'SLIP-202508-EMP005', 1, 5, 5, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 58000.00, 6760.00, 51240.00, 'Draft', 'UNPAID'),
(6, 'SLIP-202508-EMP006', 1, 6, 6, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 39800.00, 4640.00, 35160.00, 'Draft', 'UNPAID'),
(7, 'SLIP-202508-EMP007', 1, 7, 7, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 47500.00, 5530.00, 41970.00, 'Draft', 'UNPAID'),
(8, 'SLIP-202508-EMP008', 1, 8, 8, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 51000.00, 6270.00, 44730.00, 'Draft', 'UNPAID')
ON CONFLICT (payslip_number) DO UPDATE SET net_amount = EXCLUDED.net_amount;

-- ----------------------------------------------------------------------------
-- 15. Seed Payslip Lines (Breakdown for Rahul Sharma EMP001 - Screen 11/12)
-- ----------------------------------------------------------------------------
INSERT INTO payslip_lines (payslip_id, rule_id, rule_code, rule_name, category, sequence, amount) VALUES
(1, 1, 'BASIC', 'Basic Salary', 'BASIC', 1, 28000.00),
(1, 2, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 11200.00),
(1, 3, 'SPECIAL', 'Special Allowance', 'ALLOWANCE', 3, 8400.00),
(1, 4, 'CONVEYANCE', 'Conveyance Allowance', 'ALLOWANCE', 4, 1600.00),
(1, 5, 'MEDICAL', 'Medical Allowance', 'ALLOWANCE', 5, 1250.00),
(1, 6, 'GROSS', 'Gross Earnings', 'GROSS', 6, 56000.00),
(1, 7, 'PF_EMP', 'Provident Fund', 'DEDUCTION', 7, 3360.00),
(1, 8, 'PT', 'Professional Tax', 'DEDUCTION', 8, 200.00),
(1, 9, 'TDS', 'TDS Income Tax', 'DEDUCTION', 9, 2800.00),
(1, 10, 'TOTAL_DED', 'Total Deductions', 'DEDUCTION', 10, 6520.00),
(1, 11, 'NET', 'Net Take Home Salary', 'NET', 11, 49480.00),
(2, 1, 'BASIC', 'Basic Salary', 'BASIC', 1, 24250.00),
(2, 2, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 9700.00),
(2, 3, 'SPECIAL', 'Special Allowance', 'ALLOWANCE', 3, 7275.00),
(2, 6, 'GROSS', 'Gross Earnings', 'GROSS', 6, 48500.00),
(2, 7, 'PF_EMP', 'Provident Fund', 'DEDUCTION', 7, 2910.00),
(2, 11, 'NET', 'Net Take Home Salary', 'NET', 11, 42850.00);

-- ----------------------------------------------------------------------------
-- 16. Seed Audit Logs (Screen 1 & 16 Activity Tracking)
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_data) VALUES
(1, 'usr-admin-001', 'CREATE', 'EMPLOYEE', 8, '{"name": "Meera Nair", "code": "EMP008", "dept": "Finance"}'::jsonb),
(2, 'usr-admin-001', 'UPDATE', 'CONTRACT', 1, '{"status": "ACTIVE", "wage": 56000, "employee": "EMP001"}'::jsonb),
(3, 'usr-paymgr-001', 'PAYRUN_COMPUTED', 'PAYRUN', 1, '{"run_number": "PR-2025-08", "net": 362600, "count": 8}'::jsonb),
(4, 'usr-hr-001', 'APPROVE_LEAVE', 'LEAVE_REQUEST', 2, '{"employee": "EMP002", "days": 2, "type": "Sick Leave"}'::jsonb),
(5, 'usr-emp-001', 'CHECK_IN', 'ATTENDANCE', 1, '{"time": "09:00 AM", "date": "2025-08-26", "status": "Present"}'::jsonb),
(6, 'usr-admin-001', 'LOGIN', 'USER', 1, '{"email": "admin@company.com", "role": "ADMIN"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 17. Synchronize Sequence Values for all BIGSERIAL Primary Keys
-- ----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1));
SELECT setval(pg_get_serial_sequence('departments', 'id'), COALESCE((SELECT MAX(id) FROM departments), 1));
SELECT setval(pg_get_serial_sequence('working_schedules', 'id'), COALESCE((SELECT MAX(id) FROM working_schedules), 1));
SELECT setval(pg_get_serial_sequence('employees', 'id'), COALESCE((SELECT MAX(id) FROM employees), 1));
SELECT setval(pg_get_serial_sequence('salary_structures', 'id'), COALESCE((SELECT MAX(id) FROM salary_structures), 1));
SELECT setval(pg_get_serial_sequence('contracts', 'id'), COALESCE((SELECT MAX(id) FROM contracts), 1));
SELECT setval(pg_get_serial_sequence('attendance', 'id'), COALESCE((SELECT MAX(id) FROM attendance), 1));
SELECT setval(pg_get_serial_sequence('leave_types', 'id'), COALESCE((SELECT MAX(id) FROM leave_types), 1));
SELECT setval(pg_get_serial_sequence('leave_allocations', 'id'), COALESCE((SELECT MAX(id) FROM leave_allocations), 1));
SELECT setval(pg_get_serial_sequence('leave_requests', 'id'), COALESCE((SELECT MAX(id) FROM leave_requests), 1));
SELECT setval(pg_get_serial_sequence('salary_rules', 'id'), COALESCE((SELECT MAX(id) FROM salary_rules), 1));
SELECT setval(pg_get_serial_sequence('payruns', 'id'), COALESCE((SELECT MAX(id) FROM payruns), 1));
SELECT setval(pg_get_serial_sequence('payslips', 'id'), COALESCE((SELECT MAX(id) FROM payslips), 1));
SELECT setval(pg_get_serial_sequence('payslip_lines', 'id'), COALESCE((SELECT MAX(id) FROM payslip_lines), 1));
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), COALESCE((SELECT MAX(id) FROM audit_logs), 1));
