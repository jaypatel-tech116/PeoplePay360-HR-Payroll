-- ============================================================================
-- PeoplePay360 Migration: 01_payroll_constraints_and_indexes_mysql.sql
-- Compatible with MySQL 8.0+
-- ============================================================================

-- 1. Unique Index on payslips (employee_id, period_start, period_end)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payslips' AND index_name = 'idx_payslips_emp_period');
SET @sql := IF(@exist = 0, 'CREATE UNIQUE INDEX idx_payslips_emp_period ON payslips(employee_id, period_start, period_end);', 'SELECT "idx_payslips_emp_period exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Performance Composite Indexes
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'contracts' AND index_name = 'idx_contracts_emp_dates_status');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_contracts_emp_dates_status ON contracts(employee_id, start_date, end_date, status);', 'SELECT "idx_contracts_emp_dates_status exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance' AND index_name = 'idx_attendance_emp_date_status');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_attendance_emp_date_status ON attendance(employee_id, attendance_date, status);', 'SELECT "idx_attendance_emp_date_status exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'leave_requests' AND index_name = 'idx_leave_requests_emp_dates_status');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_leave_requests_emp_dates_status ON leave_requests(employee_id, start_date, end_date, status);', 'SELECT "idx_leave_requests_emp_dates_status exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payruns' AND index_name = 'idx_payruns_period_status');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_payruns_period_status ON payruns(period_start, period_end, status);', 'SELECT "idx_payruns_period_status exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'salary_rules' AND index_name = 'idx_salary_rules_structure_seq');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_salary_rules_structure_seq ON salary_rules(salary_structure_id, sequence ASC);', 'SELECT "idx_salary_rules_structure_seq exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payslip_lines' AND index_name = 'idx_payslip_lines_payslip_seq');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_payslip_lines_payslip_seq ON payslip_lines(payslip_id, sequence ASC);', 'SELECT "idx_payslip_lines_payslip_seq exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
