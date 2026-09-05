-- ============================================================================
-- PeoplePay360 - PostgreSQL 14+ Database Schema (Locked 16-Table Architecture)
-- Engineered for Full Feature Parity Across All 16 UI Screens (Admin, HR, Payroll, Employee)
-- ============================================================================

-- Clean up older and current tables in cascade
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payslip_lines CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payrun_employees CASCADE;
DROP TABLE IF EXISTS payruns CASCADE;
DROP TABLE IF EXISTS salary_rules CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS salary_structures CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_allocations CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS time_off_requests CASCADE;
DROP TABLE IF EXISTS time_off_allocations CASCADE;
DROP TABLE IF EXISTS time_off_types CASCADE;
DROP TABLE IF EXISTS payslip_warnings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS working_schedule_lines CASCADE;
DROP TABLE IF EXISTS working_schedules CASCADE;
DROP TABLE IF EXISTS job_positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================================
-- 00. Compatibility SQL Functions for MySQL-syntax queries in PostgreSQL
-- ============================================================================

CREATE OR REPLACE FUNCTION curdate() RETURNS date LANGUAGE sql STABLE AS $$
  SELECT CURRENT_DATE;
$$;

CREATE OR REPLACE FUNCTION year(d date) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT EXTRACT(YEAR FROM d)::integer;
$$;
CREATE OR REPLACE FUNCTION year(ts timestamp) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT EXTRACT(YEAR FROM ts)::integer;
$$;
CREATE OR REPLACE FUNCTION year(ts timestamptz) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT EXTRACT(YEAR FROM ts)::integer;
$$;

CREATE OR REPLACE FUNCTION month(d date) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT EXTRACT(MONTH FROM d)::integer;
$$;
CREATE OR REPLACE FUNCTION month(ts timestamp) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT EXTRACT(MONTH FROM ts)::integer;
$$;
CREATE OR REPLACE FUNCTION month(ts timestamptz) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT EXTRACT(MONTH FROM ts)::integer;
$$;

CREATE OR REPLACE FUNCTION date_format(d date, fmt text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  res text := fmt;
  ts timestamptz := d;
BEGIN
  IF d IS NULL THEN RETURN NULL; END IF;
  res := replace(res, '%d', to_char(ts, 'DD'));
  res := replace(res, '%b', to_char(ts, 'Mon'));
  res := replace(res, '%Y', to_char(ts, 'YYYY'));
  res := replace(res, '%y', to_char(ts, 'YY'));
  res := replace(res, '%m', to_char(ts, 'MM'));
  res := replace(res, '%h', to_char(ts, 'HH12'));
  res := replace(res, '%H', to_char(ts, 'HH24'));
  res := replace(res, '%i', to_char(ts, 'MI'));
  res := replace(res, '%s', to_char(ts, 'SS'));
  res := replace(res, '%p', to_char(ts, 'AM'));
  RETURN res;
END;
$$;

CREATE OR REPLACE FUNCTION date_format(ts timestamp, fmt text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  res text := fmt;
BEGIN
  IF ts IS NULL THEN RETURN NULL; END IF;
  res := replace(res, '%d', to_char(ts, 'DD'));
  res := replace(res, '%b', to_char(ts, 'Mon'));
  res := replace(res, '%Y', to_char(ts, 'YYYY'));
  res := replace(res, '%y', to_char(ts, 'YY'));
  res := replace(res, '%m', to_char(ts, 'MM'));
  res := replace(res, '%h', to_char(ts, 'HH12'));
  res := replace(res, '%H', to_char(ts, 'HH24'));
  res := replace(res, '%i', to_char(ts, 'MI'));
  res := replace(res, '%s', to_char(ts, 'SS'));
  res := replace(res, '%p', to_char(ts, 'AM'));
  RETURN res;
END;
$$;

CREATE OR REPLACE FUNCTION date_format(ts timestamptz, fmt text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  res text := fmt;
BEGIN
  IF ts IS NULL THEN RETURN NULL; END IF;
  res := replace(res, '%d', to_char(ts, 'DD'));
  res := replace(res, '%b', to_char(ts, 'Mon'));
  res := replace(res, '%Y', to_char(ts, 'YYYY'));
  res := replace(res, '%y', to_char(ts, 'YY'));
  res := replace(res, '%m', to_char(ts, 'MM'));
  res := replace(res, '%h', to_char(ts, 'HH12'));
  res := replace(res, '%H', to_char(ts, 'HH24'));
  res := replace(res, '%i', to_char(ts, 'MI'));
  res := replace(res, '%s', to_char(ts, 'SS'));
  res := replace(res, '%p', to_char(ts, 'AM'));
  RETURN res;
END;
$$;



-- ============================================================================
-- 01. roles (UI: Admin Screen 15 Users & Roles)
-- ============================================================================
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 02. departments (UI: Admin Screen 4 Departments)
-- ============================================================================
CREATE TABLE departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NULL UNIQUE,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 03. working_schedules (UI: Admin Screen 6 Working Schedules)
-- ============================================================================
CREATE TABLE working_schedules (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NULL UNIQUE,
  monday_start TIME NULL,
  monday_end TIME NULL,
  tuesday_start TIME NULL,
  tuesday_end TIME NULL,
  wednesday_start TIME NULL,
  wednesday_end TIME NULL,
  thursday_start TIME NULL,
  thursday_end TIME NULL,
  friday_start TIME NULL,
  friday_end TIME NULL,
  saturday_start TIME NULL,
  saturday_end TIME NULL,
  sunday_start TIME NULL,
  sunday_end TIME NULL,
  break_minutes INT NOT NULL DEFAULT 60,
  weekly_hours NUMERIC(6,2) NOT NULL DEFAULT 40.00,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 04. employees (UI: Admin Screen 2 & 3, HR Manager Views)
-- ============================================================================
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  employee_code VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(20) DEFAULT 'Male',
  joining_date DATE NOT NULL,
  termination_date DATE NULL,
  department_id BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
  manager_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
  schedule_id BIGINT NULL REFERENCES working_schedules(id) ON DELETE SET NULL,
  designation VARCHAR(100) NULL,
  employee_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  pipeline_stage VARCHAR(30) DEFAULT 'ACTIVE',
  work_location VARCHAR(100) DEFAULT 'Bangalore Office',
  national_id VARCHAR(50) NULL,
  bank_account VARCHAR(50) NULL,
  pan_number VARCHAR(30) NULL,
  uan_number VARCHAR(30) NULL,
  address TEXT NULL,
  city VARCHAR(80) NULL,
  state VARCHAR(80) NULL,
  country VARCHAR(80) DEFAULT 'India',
  postal_code VARCHAR(20) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 05. users (Auth, Admin Screen 15 Users & Roles)
-- ============================================================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  employee_id BIGINT NULL UNIQUE REFERENCES employees(id) ON DELETE SET NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 06. salary_structures (UI: Admin Screen 13 & Payroll Screens)
-- ============================================================================
CREATE TABLE salary_structures (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'FT',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 07. contracts (UI: Admin Screen 5 Contracts)
-- ============================================================================
CREATE TABLE contracts (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  contract_number VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  contract_type VARCHAR(30) NOT NULL DEFAULT 'Permanent',
  wage NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  pay_frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
  salary_structure_id BIGINT NULL REFERENCES salary_structures(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 08. attendance (UI: Admin Screen 7, Attendance & Leave Views)
-- ============================================================================
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in TIMESTAMPTZ NULL,
  check_out TIMESTAMPTZ NULL,
  worked_hours NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  overtime_hours NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'Present',
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_attendance_emp_date UNIQUE (employee_id, attendance_date)
);

-- ============================================================================
-- 09. leave_types (UI: Admin Screen 8 & HR Leaves Setup)
-- ============================================================================
CREATE TABLE leave_types (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE,
  unit VARCHAR(20) NOT NULL DEFAULT 'DAYS',
  requires_allocation BOOLEAN NOT NULL DEFAULT TRUE,
  is_paid BOOLEAN NOT NULL DEFAULT TRUE,
  affects_payroll BOOLEAN NOT NULL DEFAULT FALSE,
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. leave_allocations (Entitlement tracking)
-- ============================================================================
CREATE TABLE leave_allocations (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id BIGINT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  used_days NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_leave_alloc UNIQUE (employee_id, leave_type_id)
);

-- ============================================================================
-- 11. leave_requests (UI: Admin Screen 8 Time Off Requests)
-- ============================================================================
CREATE TABLE leave_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id BIGINT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC(8,2) NOT NULL,
  reason TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  approved_by VARCHAR(36) NULL REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. salary_rules (UI: Admin Screen 14 & Payroll Rules)
-- ============================================================================
CREATE TABLE salary_rules (
  id BIGSERIAL PRIMARY KEY,
  salary_structure_id BIGINT NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  sequence INT NOT NULL DEFAULT 1,
  calculation_type VARCHAR(30) NOT NULL DEFAULT 'FIXED',
  fixed_amount NUMERIC(14,2) NULL,
  percentage NUMERIC(8,4) NULL,
  formula TEXT NULL,
  default_value VARCHAR(50) DEFAULT '-',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. payruns / pay_cycles (UI: Admin Screen 9 & 10 Pay Cycles)
-- ============================================================================
CREATE TABLE payruns (
  id BIGSERIAL PRIMARY KEY,
  run_number VARCHAR(50) NOT NULL UNIQUE,
  month VARCHAR(20) NOT NULL,
  year VARCHAR(10) NOT NULL,
  pay_date DATE NOT NULL,
  salary_structure_id BIGINT NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Draft',
  employee_count INT NOT NULL DEFAULT 0,
  total_gross NUMERIC(16,2) NOT NULL DEFAULT 0.00,
  total_deductions NUMERIC(16,2) NOT NULL DEFAULT 0.00,
  total_net NUMERIC(16,2) NOT NULL DEFAULT 0.00,
  created_by VARCHAR(36) NULL REFERENCES users(id) ON DELETE SET NULL,
  computed_at TIMESTAMPTZ NULL,
  validated_at TIMESTAMPTZ NULL,
  paid_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. payslips (UI: Admin Screen 11 & Payroll Manager Screen 10/11)
-- ============================================================================
CREATE TABLE payslips (
  id BIGSERIAL PRIMARY KEY,
  payslip_number VARCHAR(50) NOT NULL UNIQUE,
  payrun_id BIGINT NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  contract_id BIGINT NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  salary_structure_id BIGINT NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  worked_days NUMERIC(8,2) NOT NULL DEFAULT 26.00,
  paid_days NUMERIC(8,2) NOT NULL DEFAULT 26.00,
  gross_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  deduction_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  net_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
  pdf_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_payslips_payrun_emp UNIQUE (payrun_id, employee_id)
);

-- ============================================================================
-- 15. payslip_lines (Itemized Earnings & Deductions Breakdown)
-- ============================================================================
CREATE TABLE payslip_lines (
  id BIGSERIAL PRIMARY KEY,
  payslip_id BIGINT NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
  rule_id BIGINT NULL REFERENCES salary_rules(id) ON DELETE SET NULL,
  rule_code VARCHAR(30) NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  sequence INT NOT NULL DEFAULT 1,
  quantity NUMERIC(12,4) NOT NULL DEFAULT 1.0000,
  rate NUMERIC(12,4) NOT NULL DEFAULT 100.0000,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  calculation_details JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 16. audit_logs (UI: Admin Screen 1 & Screen 16 Logs)
-- ============================================================================
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(36) NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NULL,
  old_data JSONB NULL,
  new_data JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================
CREATE INDEX idx_emp_department ON employees (department_id);
CREATE INDEX idx_emp_manager ON employees (manager_id);
CREATE INDEX idx_emp_status ON employees (status);
CREATE INDEX idx_contracts_emp ON contracts (employee_id);
CREATE INDEX idx_contracts_dates ON contracts (start_date, end_date);
CREATE INDEX idx_attendance_emp_date ON attendance (employee_id, attendance_date);
CREATE INDEX idx_leave_req_emp ON leave_requests (employee_id);
CREATE INDEX idx_leave_req_status ON leave_requests (status);
CREATE INDEX idx_payruns_period ON payruns (period_start, period_end);
CREATE INDEX idx_payslips_emp ON payslips (employee_id);
CREATE INDEX idx_payslips_payrun ON payslips (payrun_id);
CREATE INDEX idx_payslip_lines_slip ON payslip_lines (payslip_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
