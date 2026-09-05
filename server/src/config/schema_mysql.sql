-- ============================================================================
-- PeoplePay360 - MySQL 8.0+ Database Schema (Locked 16-Table Architecture)
-- Engineered to match all 16 UI Screens (Admin, HR, Payroll, Employee)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `peoplepay360` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `peoplepay360`;

-- Disable foreign key checks for clean teardown and rebuild
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `payslip_lines`;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `payruns`;
DROP TABLE IF EXISTS `salary_rules`;
DROP TABLE IF EXISTS `contracts`;
DROP TABLE IF EXISTS `salary_structures`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `leave_allocations`;
DROP TABLE IF EXISTS `leave_types`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `working_schedules`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 01. roles (UI: Admin Screen 15 Users & Roles)
-- ============================================================================
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 02. departments (UI: Admin Screen 4 Departments)
-- ============================================================================
CREATE TABLE `departments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(20) NULL UNIQUE,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 03. working_schedules (UI: Admin Screen 6 Working Schedules)
-- ============================================================================
CREATE TABLE `working_schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(50) NULL UNIQUE,
  `monday_start` TIME NULL,
  `monday_end` TIME NULL,
  `tuesday_start` TIME NULL,
  `tuesday_end` TIME NULL,
  `wednesday_start` TIME NULL,
  `wednesday_end` TIME NULL,
  `thursday_start` TIME NULL,
  `thursday_end` TIME NULL,
  `friday_start` TIME NULL,
  `friday_end` TIME NULL,
  `saturday_start` TIME NULL,
  `saturday_end` TIME NULL,
  `sunday_start` TIME NULL,
  `sunday_end` TIME NULL,
  `break_minutes` INT UNSIGNED NOT NULL DEFAULT 60,
  `weekly_hours` DECIMAL(6,2) NOT NULL DEFAULT 40.00,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 04. employees (UI: Admin Screen 2 Employees List & Screen 3 Employee Details)
-- ============================================================================
CREATE TABLE `employees` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(30) NOT NULL UNIQUE,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `date_of_birth` DATE NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  `joining_date` DATE NOT NULL,
  `termination_date` DATE NULL,
  `department_id` BIGINT UNSIGNED NULL,
  `manager_id` BIGINT UNSIGNED NULL,
  `schedule_id` BIGINT UNSIGNED NULL,
  `designation` VARCHAR(100) NULL,
  `employee_type` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN') NOT NULL DEFAULT 'FULL_TIME',
  `status` ENUM('ACTIVE', 'INACTIVE', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `work_location` VARCHAR(100) DEFAULT 'Bangalore Office',
  `national_id` VARCHAR(50) NULL,
  `bank_account` VARCHAR(50) NULL,
  `pan_number` VARCHAR(30) NULL,
  `uan_number` VARCHAR(30) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(80) NULL,
  `state` VARCHAR(80) NULL,
  `country` VARCHAR(80) DEFAULT 'India',
  `postal_code` VARCHAR(20) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_emp_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emp_manager` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emp_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `working_schedules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 05. users (UI: Admin Screen 15 Users & Roles & Auth)
-- ============================================================================
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_users_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 06. salary_structures (UI: Admin Screen 13 & Payroll Manager Screen 13)
-- ============================================================================
CREATE TABLE `salary_structures` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `type` ENUM('FT', 'PT', 'Contract', 'Intern') NOT NULL DEFAULT 'FT',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 07. contracts (UI: Admin Screen 5 Contracts)
-- ============================================================================
CREATE TABLE `contracts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `contract_number` VARCHAR(50) NOT NULL UNIQUE,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `contract_type` ENUM('Permanent', 'Fixed Term', 'Probation', 'Contract') NOT NULL DEFAULT 'Permanent',
  `wage` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `pay_frequency` VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
  `salary_structure_id` BIGINT UNSIGNED NULL,
  `status` ENUM('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_contracts_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contracts_structure` FOREIGN KEY (`salary_structure_id`) REFERENCES `salary_structures` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 08. attendance (UI: Admin Screen 7 & Payroll Manager Screen 16)
-- ============================================================================
CREATE TABLE `attendance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `attendance_date` DATE NOT NULL,
  `check_in` DATETIME NULL,
  `check_out` DATETIME NULL,
  `worked_hours` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `overtime_hours` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Present', 'Absent', 'Half Day', 'On Leave') NOT NULL DEFAULT 'Present',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attendance_emp_date` (`employee_id`, `attendance_date`),
  CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 09. leave_types (UI: Admin Screen 8 & HR Leaves Setup)
-- ============================================================================
CREATE TABLE `leave_types` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `unit` ENUM('DAYS', 'HOURS') NOT NULL DEFAULT 'DAYS',
  `requires_allocation` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_paid` BOOLEAN NOT NULL DEFAULT TRUE,
  `affects_payroll` BOOLEAN NOT NULL DEFAULT FALSE,
  `requires_approval` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. leave_allocations (Entitlement tracking)
-- ============================================================================
CREATE TABLE `leave_allocations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `leave_type_id` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_days` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `used_days` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_alloc_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alloc_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. leave_requests (UI: Admin Screen 8 Time Off Requests)
-- ============================================================================
CREATE TABLE `leave_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `leave_type_id` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `days` DECIMAL(8,2) NOT NULL,
  `reason` TEXT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `approved_by` VARCHAR(36) NULL,
  `approved_at` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_leave_req_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_req_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_req_approver` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. salary_rules (UI: Admin Screen 14 & Payroll Manager Screen 14)
-- ============================================================================
CREATE TABLE `salary_rules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `salary_structure_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `category` ENUM('BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'CONTRIBUTION', 'NET', 'OTHER') NOT NULL,
  `sequence` INT NOT NULL DEFAULT 1,
  `calculation_type` ENUM('FIXED', 'PERCENTAGE', 'FORMULA') NOT NULL DEFAULT 'FIXED',
  `fixed_amount` DECIMAL(14,2) NULL,
  `percentage` DECIMAL(8,4) NULL,
  `formula` TEXT NULL,
  `default_value` VARCHAR(50) DEFAULT '-',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rules_structure` FOREIGN KEY (`salary_structure_id`) REFERENCES `salary_structures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. payruns / pay_cycles (UI: Admin Screen 9 Pay Cycles & Screen 10 Create Cycle)
-- ============================================================================
CREATE TABLE `payruns` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `run_number` VARCHAR(50) NOT NULL UNIQUE,
  `month` VARCHAR(20) NOT NULL,
  `year` VARCHAR(10) NOT NULL,
  `pay_date` DATE NOT NULL,
  `salary_structure_id` BIGINT UNSIGNED NOT NULL,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `status` ENUM('Draft', 'Processing', 'Computed', 'Validated', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Draft',
  `employee_count` INT NOT NULL DEFAULT 0,
  `total_gross` DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  `total_deductions` DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  `total_net` DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  `created_by` VARCHAR(36) NULL,
  `computed_at` DATETIME NULL,
  `validated_at` DATETIME NULL,
  `paid_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payruns_structure` FOREIGN KEY (`salary_structure_id`) REFERENCES `salary_structures` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payruns_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. payslips (UI: Admin Screen 11 & Payroll Manager Screen 10/11)
-- ============================================================================
CREATE TABLE `payslips` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payslip_number` VARCHAR(50) NOT NULL UNIQUE,
  `payrun_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `contract_id` BIGINT UNSIGNED NOT NULL,
  `salary_structure_id` BIGINT UNSIGNED NOT NULL,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `worked_days` DECIMAL(8,2) NOT NULL DEFAULT 26.00,
  `paid_days` DECIMAL(8,2) NOT NULL DEFAULT 26.00,
  `gross_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `deduction_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `net_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Draft', 'Computed', 'Validated', 'Paid', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_status` ENUM('UNPAID', 'PAID', 'FAILED') NOT NULL DEFAULT 'UNPAID',
  `pdf_url` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payslips_payrun_emp` (`payrun_id`, `employee_id`),
  CONSTRAINT `fk_payslips_payrun` FOREIGN KEY (`payrun_id`) REFERENCES `payruns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payslips_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payslips_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payslips_structure` FOREIGN KEY (`salary_structure_id`) REFERENCES `salary_structures` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. payslip_lines (Itemized Earnings & Deductions Breakdown)
-- ============================================================================
CREATE TABLE `payslip_lines` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payslip_id` BIGINT UNSIGNED NOT NULL,
  `rule_id` BIGINT UNSIGNED NULL,
  `rule_code` VARCHAR(30) NOT NULL,
  `rule_name` VARCHAR(100) NOT NULL,
  `category` ENUM('BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'CONTRIBUTION', 'NET', 'OTHER') NOT NULL,
  `sequence` INT NOT NULL DEFAULT 1,
  `quantity` DECIMAL(12,4) NOT NULL DEFAULT 1.0000,
  `rate` DECIMAL(12,4) NOT NULL DEFAULT 100.0000,
  `amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `calculation_details` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lines_payslip` FOREIGN KEY (`payslip_id`) REFERENCES `payslips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lines_rule` FOREIGN KEY (`rule_id`) REFERENCES `salary_rules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. audit_logs (UI: Admin Screen 1 Recent Activities & Screen 16 Logs)
-- ============================================================================
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` BIGINT UNSIGNED NULL,
  `old_data` JSON NULL,
  `new_data` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Performance Indexes for Real-Time Querying
-- ============================================================================
CREATE INDEX `idx_emp_department` ON `employees` (`department_id`);
CREATE INDEX `idx_emp_manager` ON `employees` (`manager_id`);
CREATE INDEX `idx_emp_status` ON `employees` (`status`);
CREATE INDEX `idx_contracts_emp` ON `contracts` (`employee_id`);
CREATE INDEX `idx_contracts_dates` ON `contracts` (`start_date`, `end_date`);
CREATE INDEX `idx_attendance_emp_date` ON `attendance` (`employee_id`, `attendance_date`);
CREATE INDEX `idx_leave_req_emp` ON `leave_requests` (`employee_id`);
CREATE INDEX `idx_leave_req_status` ON `leave_requests` (`status`);
CREATE INDEX `idx_payruns_period` ON `payruns` (`period_start`, `period_end`);
CREATE INDEX `idx_payslips_emp` ON `payslips` (`employee_id`);
CREATE INDEX `idx_payslips_payrun` ON `payslips` (`payrun_id`);
CREATE INDEX `idx_payslip_lines_slip` ON `payslip_lines` (`payslip_id`);
CREATE INDEX `idx_audit_entity` ON `audit_logs` (`entity_type`, `entity_id`);
