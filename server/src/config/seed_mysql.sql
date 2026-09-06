-- ============================================================================
-- PeoplePay360 - MySQL Seed & Test Dataset (16 Tables)
-- Exact match to all 16 UI Screens (Rahul Sharma, Priya Mehta, Vikram Rao, etc.)
-- ============================================================================

USE `peoplepay360`;

-- ----------------------------------------------------------------------------
-- 01. Seed Roles
-- ----------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `code`, `name`, `description`, `is_active`) VALUES
(1, 'ADMIN', 'Administrator', 'Full platform administration and system governance', 1),
(2, 'HR_MANAGER', 'HR Manager', 'HR master data, employee onboarding, leaves, and attendance', 1),
(3, 'HR_PAYROLL_MANAGER', 'HR Payroll Manager', 'Full payroll cycle execution, structure governance, and disbursement', 1),
(4, 'HR_PAYROLL_USER', 'HR Payroll User', 'Operational payroll execution and payslip processing', 1),
(5, 'EMPLOYEE', 'Employee', 'Self-service portal, view payslips, and apply for leaves', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 02. Seed Departments
-- ----------------------------------------------------------------------------
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `is_active`) VALUES
(1, 'Engineering', 'ENG', 'Product development and engineering team', 1),
(2, 'HR', 'HR', 'Human resources and people operations', 1),
(3, 'Sales', 'SAL', 'Sales and business development', 1),
(4, 'Marketing', 'MKT', 'Marketing and communications', 1),
(5, 'Product', 'PROD', 'Product design and UI/UX management', 1),
(6, 'Finance', 'FIN', 'Finance, treasury, and accounting', 1),
(7, 'Operations', 'OPS', 'Day-to-day operations and customer support', 1),
(8, 'IT', 'IT', 'IT infrastructure, systems, and security', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 03. Seed Working Schedules
-- ----------------------------------------------------------------------------
INSERT INTO `working_schedules` (`id`, `name`, `code`, `monday_start`, `monday_end`, `break_minutes`, `weekly_hours`, `description`, `is_active`) VALUES
(1, 'Standard (9-6)', 'STD_9_6', '09:00:00', '18:00:00', 60, 40.00, 'Default full time schedule (Mon-Fri 9:00 AM - 6:00 PM)', 1),
(2, 'Flexible', 'FLEX_10_7', '10:00:00', '19:00:00', 60, 40.00, 'Flexible working hours (Mon-Fri 10:00 AM - 7:00 PM)', 1),
(3, 'Part Time', 'PART_TIME', '09:00:00', '13:00:00', 0, 20.00, 'Part time schedule (Mon-Fri 9:00 AM - 1:00 PM)', 1),
(4, 'Shift A', 'SHIFT_A', '06:00:00', '14:00:00', 30, 45.00, 'Morning shift (Mon-Sat 6:00 AM - 2:00 PM)', 1),
(5, 'Shift B', 'SHIFT_B', '14:00:00', '22:00:00', 30, 45.00, 'Evening shift (Mon-Sat 2:00 PM - 10:00 PM)', 1),
(6, 'Shift C', 'SHIFT_C', '22:00:00', '06:00:00', 30, 45.00, 'Night shift (Mon-Sat 10:00 PM - 6:00 AM)', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 04. Seed Employees (Matches EMP001 to EMP008 in all screenshots)
-- ----------------------------------------------------------------------------
INSERT INTO `employees` (
  `id`, `employee_code`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`,
  `gender`, `joining_date`, `department_id`, `schedule_id`, `designation`,
  `employee_type`, `status`, `pipeline_stage`, `work_location`, `national_id`, `bank_account`,
  `pan_number`, `uan_number`, `address`, `city`, `state`, `country`
) VALUES
(1, 'EMP001', 'Rahul', 'Sharma', 'rahul@company.com', '+91 98765 43210', '1995-01-12', 'Male', '2023-09-01', 1, 1, 'Software Developer', 'FULL_TIME', 'ACTIVE', 'ACTIVE', 'Bangalore Office', 'XXXX1234', 'HDFC **** 4321', 'ABCDE1234F', '100012345678', 'Indiranagar', 'Bangalore', 'Karnataka', 'India'),
(2, 'EMP002', 'Priya', 'Mehta', 'priya@company.com', '+91 98765 43211', '1994-04-24', 'Female', '2022-06-15', 2, 1, 'HR Manager', 'FULL_TIME', 'ACTIVE', 'ACTIVE', 'Mumbai Office', 'XXXX5678', 'ICICI **** 8765', 'BCDEF2345G', '100023456789', 'Andheri West', 'Mumbai', 'Maharashtra', 'India'),
(3, 'EMP003', 'Vikram', 'Rao', 'vikram@company.com', '+91 98765 43212', '1992-08-18', 'Male', '2023-01-10', 3, 1, 'Sales Executive', 'FULL_TIME', 'ACTIVE', 'ACTIVE', 'Delhi Office', 'XXXX9012', 'SBI **** 1234', 'CDEFG3456H', '100034567890', 'Connaught Place', 'New Delhi', 'Delhi', 'India'),
(4, 'EMP004', 'Sneha', 'Iyer', 'sneha@company.com', '+91 98765 43213', '1996-11-05', 'Female', '2024-03-01', 5, 1, 'UI/UX Designer', 'FULL_TIME', 'ACTIVE', 'ON_LEAVE', 'Bangalore Office', 'XXXX3456', 'Axis **** 6543', 'DEFGH4567I', '100045678901', 'Koramangala', 'Bangalore', 'Karnataka', 'India'),
(5, 'EMP005', 'Aditya', 'Gupta', 'aditya@company.com', '+91 98765 43214', '1993-07-14', 'Male', '2024-02-20', 1, 1, 'DevOps Engineer', 'FULL_TIME', 'ACTIVE', 'ON_LEAVE', 'Bangalore Office', 'XXXX7890', 'HDFC **** 7890', 'EFGHI5678J', '100056789012', 'Whitefield', 'Bangalore', 'Karnataka', 'India'),
(6, 'EMP006', 'Neha', 'Patel', 'neha@company.com', '+91 98765 43215', '1997-09-30', 'Female', '2023-09-15', 2, 1, 'HR Executive', 'FULL_TIME', 'ACTIVE', 'NEW_JOINER', 'Mumbai Office', 'XXXX2345', 'Kotak **** 4321', 'FGHIJ6789K', '100067890123', 'Bandra', 'Mumbai', 'Maharashtra', 'India'),
(7, 'EMP007', 'Rohan', 'Desai', 'rohan@company.com', '+91 98765 43216', '1991-12-02', 'Male', '2022-10-01', 4, 1, 'Marketing Specialist', 'FULL_TIME', 'INACTIVE', 'EXITING', 'Bangalore Office', 'XXXX6789', 'ICICI **** 9012', 'GHIJK7890L', '100078901234', 'Jayanagar', 'Bangalore', 'Karnataka', 'India'),
(8, 'EMP008', 'Meera', 'Nair', 'meera@company.com', '+91 98765 43217', '1994-03-22', 'Female', '2024-01-15', 6, 1, 'Accountant', 'FULL_TIME', 'ACTIVE', 'ON_LEAVE', 'Bangalore Office', 'XXXX0123', 'Federal **** 5678', 'HIJKL8901M', '100089012345', 'MG Road', 'Bangalore', 'Karnataka', 'India')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- ----------------------------------------------------------------------------
-- 05. Seed Users (Bcrypt hash for password "123456")
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `role_id`, `employee_id`, `email`, `password_hash`, `full_name`, `is_active`, `last_login_at`) VALUES
('usr-admin-001', 1, NULL, 'admin@company.com', '$2b$10$aNJhxODeizUeOZ5Xd2duze4r.vjxEbV7UFOBetssBOKA1plonDy7.', 'System Administrator', 1, '2025-08-26 10:24:00'),
('usr-admin-002', 1, NULL, 'admin@gmail.com', '$2b$10$aNJhxODeizUeOZ5Xd2duze4r.vjxEbV7UFOBetssBOKA1plonDy7.', 'Administrator', 1, '2025-08-26 10:24:00'),
('usr-hr-001', 2, 2, 'hr@gmail.com', '$2b$10$oOXTMorlkrVyw02njMyiUOZEpkQvrUcwCL1GV44i5WFpJMFKRFwX.', 'Priya Mehta (HR Lead)', 1, '2025-08-26 09:15:00'),
('usr-paymgr-001', 3, NULL, 'payroll_mgr@gmail.com', '$2b$10$7ZX.Rpl.lnxM9kSp4Hz/GOvTZfP5S.TVsqO7CEGSAg9s4w5ggoeBy', 'HR Payroll Manager', 1, '2025-08-27 11:30:00'),
('usr-paymgr-002', 3, NULL, 'payroll@gmail.com', '$2b$10$7ZX.Rpl.lnxM9kSp4Hz/GOvTZfP5S.TVsqO7CEGSAg9s4w5ggoeBy', 'Payroll Manager', 1, '2025-08-27 11:30:00'),
('usr-payusr-001', 4, 6, 'neha@company.com', '$2b$10$lWuBaEz1OmyJmN2T..7Jzu6lK.4dGE28AdDuGx7oG3SGgVy6hzOES', 'Neha Patel (Payroll User)', 1, '2025-08-25 16:32:00'),
('usr-payusr-002', 4, NULL, 'payuser@gmail.com', '$2b$10$lWuBaEz1OmyJmN2T..7Jzu6lK.4dGE28AdDuGx7oG3SGgVy6hzOES', 'Payroll Operator', 1, '2025-08-25 16:32:00'),
('usr-emp-001', 5, 1, 'employee1@gmail.com', '$2b$10$E84t9oYirfClgo0NL3FP1.WtF.M//EKUlVueErJOW8TjmRoFXMQkG', 'Rahul Sharma', 1, '2025-08-28 08:45:00'),
('usr-emp-002', 5, NULL, 'employee@gmail.com', '$2b$10$E84t9oYirfClgo0NL3FP1.WtF.M//EKUlVueErJOW8TjmRoFXMQkG', 'Rahul Sharma', 1, '2025-08-28 08:45:00')
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);

-- ----------------------------------------------------------------------------
-- 06. Seed Salary Structures (Screen 13)
-- ----------------------------------------------------------------------------
INSERT INTO `salary_structures` (`id`, `code`, `name`, `description`, `type`, `is_active`) VALUES
(1, 'SS001', 'Default Structure (Full Time)', 'Standard salary structure for full time employees', 'FT', 1),
(2, 'SS002', 'Part Time Structure', 'For part time employees', 'PT', 1),
(3, 'SS003', 'Contract Structure', 'For contract employees', 'Contract', 1),
(4, 'SS004', 'Intern Structure', 'For interns and trainees', 'Intern', 1),
(5, 'SS005', 'Management Structure', 'For management level employees', 'FT', 1),
(6, 'SS006', 'Sales Structure', 'For sales team with incentive components', 'FT', 1),
(7, 'SS007', 'Technical Structure', 'For technical engineering team', 'FT', 0),
(8, 'SS008', 'Custom Structure', 'Custom structure for special contractor roles', 'Contract', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 07. Seed Contracts (Screen 5)
-- ----------------------------------------------------------------------------
INSERT INTO `contracts` (
  `id`, `employee_id`, `contract_number`, `start_date`, `end_date`,
  `contract_type`, `wage`, `currency`, `pay_frequency`, `salary_structure_id`, `status`
) VALUES
(1, 1, 'CNT-EMP001', '2023-01-01', NULL, 'Permanent', 56000.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(2, 2, 'CNT-EMP002', '2023-08-15', NULL, 'Permanent', 48500.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(3, 3, 'CNT-EMP003', '2023-06-01', '2025-05-31', 'Fixed Term', 61000.00, 'INR', 'MONTHLY', 6, 'ACTIVE'),
(4, 4, 'CNT-EMP004', '2023-08-01', NULL, 'Permanent', 49000.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(5, 5, 'CNT-EMP005', '2025-07-01', '2025-12-31', 'Probation', 58000.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(6, 6, 'CNT-EMP006', '2023-09-01', '2026-08-31', 'Fixed Term', 39800.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(7, 7, 'CNT-EMP007', '2023-03-01', NULL, 'Permanent', 47500.00, 'INR', 'MONTHLY', 1, 'ACTIVE'),
(8, 8, 'CNT-EMP008', '2024-01-01', '2024-12-31', 'Contract', 50000.00, 'INR', 'MONTHLY', 3, 'EXPIRED')
ON DUPLICATE KEY UPDATE `contract_number` = VALUES(`contract_number`);

-- ----------------------------------------------------------------------------
-- 08. Seed Attendance Records (Screen 7)
-- ----------------------------------------------------------------------------
INSERT INTO `attendance` (`id`, `employee_id`, `attendance_date`, `check_in`, `check_out`, `worked_hours`, `status`) VALUES
(1, 1, '2025-08-26', '2025-08-26 09:00:00', '2025-08-26 18:05:00', 9.08, 'Present'),
(2, 2, '2025-08-26', '2025-08-26 09:15:00', '2025-08-26 18:00:00', 8.75, 'Present'),
(3, 3, '2025-08-26', NULL, NULL, 0.00, 'Absent'),
(4, 4, '2025-08-26', '2025-08-26 09:30:00', '2025-08-26 13:30:00', 4.00, 'Half Day'),
(5, 5, '2025-08-26', '2025-08-26 09:00:00', '2025-08-26 18:00:00', 9.00, 'Present'),
(6, 6, '2025-08-26', NULL, NULL, 0.00, 'On Leave'),
(7, 7, '2025-08-26', '2025-08-26 09:05:00', '2025-08-26 18:10:00', 9.08, 'Present'),
(8, 8, '2025-08-26', '2025-08-26 09:10:00', '2025-08-26 18:00:00', 8.83, 'Present')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ----------------------------------------------------------------------------
-- 09. Seed Leave Types (Screen 8)
-- ----------------------------------------------------------------------------
INSERT INTO `leave_types` (`id`, `code`, `name`, `unit`, `requires_allocation`, `is_paid`, `affects_payroll`, `requires_approval`) VALUES
(1, 'ANNUAL', 'Annual Leave', 'DAYS', 1, 1, 0, 1),
(2, 'SICK', 'Sick Leave', 'DAYS', 1, 1, 0, 1),
(3, 'CASUAL', 'Casual Leave', 'DAYS', 1, 1, 0, 1),
(4, 'MATERNITY', 'Maternity Leave', 'DAYS', 1, 1, 0, 1),
(5, 'PATERNITY', 'Paternity Leave', 'DAYS', 1, 1, 0, 1),
(6, 'UNPAID', 'Unpaid Leave / LOP', 'DAYS', 0, 0, 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 10. Seed Leave Allocations
-- ----------------------------------------------------------------------------
INSERT INTO `leave_allocations` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `used_days`, `status`) VALUES
(1, 1, 1, '2025-01-01', '2025-12-31', 18.00, 5.00, 'APPROVED'),
(2, 1, 2, '2025-01-01', '2025-12-31', 12.00, 2.00, 'APPROVED'),
(3, 2, 1, '2025-01-01', '2025-12-31', 18.00, 6.00, 'APPROVED'),
(4, 4, 4, '2025-01-01', '2025-12-31', 90.00, 30.00, 'APPROVED')
ON DUPLICATE KEY UPDATE `total_days` = VALUES(`total_days`);

-- ----------------------------------------------------------------------------
-- 11. Seed Leave Requests (Screen 8)
-- ----------------------------------------------------------------------------
INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days`, `reason`, `status`) VALUES
(1, 1, 1, '2025-09-12', '2025-09-16', 5.00, 'Family vacation trip', 'Pending'),
(2, 2, 2, '2025-09-10', '2025-09-12', 3.00, 'Viral fever recovery', 'Pending'),
(3, 3, 3, '2025-08-01', '2025-08-02', 2.00, 'Personal work', 'Rejected'),
(4, 4, 4, '2025-07-01', '2025-07-30', 30.00, 'Maternity leave period', 'Approved'),
(5, 5, 1, '2025-08-15', '2025-08-20', 6.00, 'Annual trip home', 'Pending'),
(6, 6, 2, '2025-08-25', '2025-08-26', 2.00, 'Medical rest', 'Approved'),
(7, 7, 5, '2025-09-10', '2025-09-12', 3.00, 'Newborn care', 'Pending'),
(8, 8, 3, '2025-08-05', '2025-08-06', 2.00, 'Family wedding event', 'Approved')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ----------------------------------------------------------------------------
-- 12. Seed Salary Rules (Screen 14)
-- ----------------------------------------------------------------------------
INSERT INTO `salary_rules` (
  `id`, `salary_structure_id`, `code`, `name`, `category`, `sequence`,
  `calculation_type`, `fixed_amount`, `percentage`, `default_value`, `is_active`
) VALUES
(1, 1, 'BASIC', 'Basic Salary', 'BASIC', 1, 'FIXED', 30000.00, NULL, '0', 1),
(2, 1, 'HRA', 'House Rent Allowance', 'ALLOWANCE', 2, 'PERCENTAGE', NULL, 40.0000, '40%', 1),
(3, 1, 'CONV', 'Conveyance Allowance', 'ALLOWANCE', 3, 'FIXED', 2500.00, NULL, '2,500', 1),
(4, 1, 'MED', 'Medical Allowance', 'ALLOWANCE', 4, 'FIXED', 1500.00, NULL, '1,500', 1),
(5, 1, 'SPEC', 'Special Allowance', 'ALLOWANCE', 5, 'FIXED', 5000.00, NULL, '-', 1),
(6, 1, 'PF', 'Provident Fund', 'DEDUCTION', 6, 'PERCENTAGE', NULL, 12.0000, '12%', 1),
(7, 1, 'PT', 'Professional Tax', 'DEDUCTION', 7, 'FIXED', 200.00, NULL, '200', 1),
(8, 1, 'ESI', 'ESI', 'DEDUCTION', 8, 'PERCENTAGE', NULL, 0.7500, '0.75%', 1),
(9, 1, 'TDS', 'TDS', 'DEDUCTION', 9, 'FIXED', 1500.00, NULL, '-', 1),
(10, 1, 'GRAT', 'Gratuity', 'OTHER', 10, 'FORMULA', NULL, NULL, '-', 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 13. Seed Payruns / Pay Cycles (Screen 9)
-- ----------------------------------------------------------------------------
INSERT INTO `payruns` (
  `id`, `run_number`, `month`, `year`, `pay_date`, `salary_structure_id`,
  `period_start`, `period_end`, `status`, `employee_count`, `total_gross`, `total_deductions`, `total_net`
) VALUES
(1, 'PR-2025-08', 'Aug', '2025', '2025-08-31', 1, '2025-08-01', '2025-08-31', 'Processing', 48, 2860000.00, 420600.00, 2439400.00),
(2, 'PR-2025-07', 'Jul', '2025', '2025-07-31', 1, '2025-07-01', '2025-07-31', 'Completed', 47, 2790000.00, 405200.00, 2384800.00),
(3, 'PR-2025-06', 'Jun', '2025', '2025-06-30', 1, '2025-06-01', '2025-06-30', 'Completed', 46, 2640000.00, 390500.00, 2249500.00),
(4, 'PR-2025-05', 'May', '2025', '2025-05-31', 1, '2025-05-01', '2025-05-31', 'Completed', 46, 2580000.00, 382000.00, 2198000.00),
(5, 'PR-2025-04', 'Apr', '2025', '2025-04-30', 1, '2025-04-01', '2025-04-30', 'Completed', 45, 2510000.00, 375300.00, 2134700.00),
(6, 'PR-2025-03', 'Mar', '2025', '2025-03-31', 1, '2025-03-01', '2025-03-31', 'Completed', 44, 2490000.00, 369800.00, 2130200.00),
(7, 'PR-2025-02', 'Feb', '2025', '2025-02-28', 1, '2025-02-01', '2025-02-28', 'Completed', 44, 2420000.00, 360000.00, 2060000.00),
(8, 'PR-2025-01', 'Jan', '2025', '2025-01-31', 1, '2025-01-01', '2025-01-31', 'Completed', 42, 2380000.00, 348600.00, 2031400.00)
ON DUPLICATE KEY UPDATE `total_net` = VALUES(`total_net`);

-- ----------------------------------------------------------------------------
-- 14. Seed Payslips (Screen 11)
-- ----------------------------------------------------------------------------
INSERT INTO `payslips` (
  `id`, `payslip_number`, `payrun_id`, `employee_id`, `contract_id`, `salary_structure_id`,
  `period_start`, `period_end`, `worked_days`, `paid_days`, `gross_amount`, `deduction_amount`, `net_amount`, `status`, `payment_status`
) VALUES
(1, 'PS-2025-08-001', 1, 1, 1, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 52000.00, 5300.00, 46700.00, 'Paid', 'PAID'),
(2, 'PS-2025-08-002', 1, 2, 2, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 48500.00, 4800.00, 43700.00, 'Paid', 'PAID'),
(3, 'PS-2025-08-003', 1, 3, 3, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 61000.00, 6200.00, 54800.00, 'Paid', 'PAID'),
(4, 'PS-2025-08-004', 1, 4, 4, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 49000.00, 5000.00, 44000.00, 'Pending', 'UNPAID'),
(5, 'PS-2025-08-005', 1, 5, 5, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 58000.00, 5900.00, 52100.00, 'Paid', 'PAID'),
(6, 'PS-2025-08-006', 1, 6, 6, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 39800.00, 4200.00, 35600.00, 'Paid', 'PAID'),
(7, 'PS-2025-08-007', 1, 7, 7, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 47500.00, 5200.00, 42300.00, 'Pending', 'UNPAID'),
(8, 'PS-2025-08-008', 1, 8, 8, 1, '2025-08-01', '2025-08-31', 26.00, 26.00, 50000.00, 4100.00, 45900.00, 'Paid', 'PAID')
ON DUPLICATE KEY UPDATE `net_amount` = VALUES(`net_amount`);

-- ----------------------------------------------------------------------------
-- 15. Seed Payslip Lines (Screen 11 Itemized Breakdown for Rahul Sharma)
-- ----------------------------------------------------------------------------
INSERT INTO `payslip_lines` (`payslip_id`, `rule_id`, `rule_code`, `rule_name`, `category`, `sequence`, `amount`) VALUES
(1, 1, 'BASIC', 'Basic Salary', 'BASIC', 1, 30000.00),
(1, 2, 'HRA', 'House Rent Allowance (40%)', 'ALLOWANCE', 2, 12000.00),
(1, 3, 'CONV', 'Conveyance Allowance', 'ALLOWANCE', 3, 2000.00),
(1, 5, 'SPEC', 'Special Allowance', 'ALLOWANCE', 4, 5000.00),
(1, 6, 'PF', 'Provident Fund (12%)', 'DEDUCTION', 5, 3600.00),
(1, 7, 'PT', 'Professional Tax', 'DEDUCTION', 6, 200.00),
(1, 9, 'TDS', 'Income Tax / TDS', 'DEDUCTION', 7, 1500.00);

-- ----------------------------------------------------------------------------
-- 16. Seed Audit Logs (Screen 1 Recent Activities & Screen 16 Logs)
-- ----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `new_data`) VALUES
(1, 'usr-admin-001', 'Employee created', 'employees', 8, '{"code": "EMP008", "name": "Meera Nair", "department": "Finance"}'),
(2, 'usr-hr-001', 'Leave approved', 'leave_requests', 6, '{"employee": "Neha Patel", "days": 2, "type": "Sick Leave"}'),
(3, 'usr-paymgr-001', 'Payroll processed', 'payruns', 1, '{"cycle": "August 2025", "total_net": 2439400.00}'),
(4, 'usr-admin-001', 'Department added', 'departments', 8, '{"name": "IT", "code": "IT"}'),
(5, 'usr-admin-001', 'Salary structure updated', 'salary_structures', 1, '{"code": "SS001", "status": "Active"}')
ON DUPLICATE KEY UPDATE `action` = VALUES(`action`);
