-- PeoplePay360 Database Schema (PostgreSQL)

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS payslip_warnings CASCADE;
DROP TABLE IF EXISTS payslip_lines CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payrun_employees CASCADE;
DROP TABLE IF EXISTS payruns CASCADE;
DROP TABLE IF EXISTS salary_rules CASCADE;
DROP TABLE IF EXISTS salary_structures CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS time_off_requests CASCADE;
DROP TABLE IF EXISTS time_off_allocations CASCADE;
DROP TABLE IF EXISTS time_off_types CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS working_schedule_lines CASCADE;
DROP TABLE IF EXISTS working_schedules CASCADE;
DROP TABLE IF EXISTS job_positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Job Positions
CREATE TABLE job_positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Working Schedules
CREATE TABLE working_schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('full_time', 'part_time', 'shift', 'flexible')),
    total_weekly_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Working Schedule Lines
CREATE TABLE working_schedule_lines (
    id SERIAL PRIMARY KEY,
    working_schedule_id INTEGER NOT NULL REFERENCES working_schedules(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- FK added after users table created
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id INTEGER REFERENCES departments(id) ON DELETE RESTRICT,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    job_position_id INTEGER REFERENCES job_positions(id) ON DELETE RESTRICT,
    working_schedule_id INTEGER REFERENCES working_schedules(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    employee_type VARCHAR(50) NOT NULL DEFAULT 'full_time' CHECK (employee_type IN ('full_time', 'part_time', 'contract', 'intern')),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(50),
    bank_verified BOOLEAN NOT NULL DEFAULT FALSE,
    hire_date DATE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Circular FK for employees.user_id
ALTER TABLE employees ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 8. Salary Structures
CREATE TABLE salary_structures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Contracts
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    department_id INTEGER REFERENCES departments(id) ON DELETE RESTRICT,
    job_position_id INTEGER REFERENCES job_positions(id) ON DELETE RESTRICT,
    wage NUMERIC(12, 2) NOT NULL CHECK (wage > 0),
    salary_structure_id INTEGER NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
    working_schedule_id INTEGER NOT NULL REFERENCES working_schedules(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = open ended
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Time Off Types
CREATE TABLE time_off_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'days' CHECK (unit IN ('days', 'hours')),
    requires_allocation BOOLEAN NOT NULL DEFAULT TRUE,
    approval_required BOOLEAN NOT NULL DEFAULT TRUE,
    affects_payroll BOOLEAN NOT NULL DEFAULT FALSE, -- e.g. unpaid leave affects payroll
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Time Off Allocations
CREATE TABLE time_off_allocations (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    time_off_type_id INTEGER NOT NULL REFERENCES time_off_types(id) ON DELETE RESTRICT,
    allocated_amount NUMERIC(6, 2) NOT NULL CHECK (allocated_amount >= 0),
    taken_amount NUMERIC(6, 2) NOT NULL DEFAULT 0.00 CHECK (taken_amount >= 0),
    remaining_amount NUMERIC(6, 2) NOT NULL CHECK (remaining_amount >= 0),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'refused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Time Off Requests
CREATE TABLE time_off_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    time_off_type_id INTEGER NOT NULL REFERENCES time_off_types(id) ON DELETE RESTRICT,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    duration NUMERIC(6, 2) NOT NULL CHECK (duration > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'refused')),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    decided_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Attendances
CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    worked_hours NUMERIC(6, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'late', 'overtime', 'missing_checkout', 'corrected')),
    corrected_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    correction_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Salary Rules
CREATE TABLE salary_rules (
    id SERIAL PRIMARY KEY,
    salary_structure_id INTEGER NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('basic', 'allowance', 'gross', 'deduction', 'net')),
    sequence INTEGER NOT NULL DEFAULT 1,
    computation_method VARCHAR(50) NOT NULL CHECK (computation_method IN ('fixed', 'percentage', 'formula')),
    amount NUMERIC(12, 2),
    percentage_of_rule_code VARCHAR(50),
    formula TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (salary_structure_id, code)
);

-- 15. Payruns
CREATE TABLE payruns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    salary_structure_id INTEGER NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'computed', 'validated', 'paid')),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_gross NUMERIC(14, 2) DEFAULT 0.00,
    total_net NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Payrun Employees (Wizard Step 2 join table)
CREATE TABLE payrun_employees (
    id SERIAL PRIMARY KEY,
    payrun_id INTEGER NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (payrun_id, employee_id)
);

-- 17. Payslips
CREATE TABLE payslips (
    id SERIAL PRIMARY KEY,
    payrun_id INTEGER NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    worked_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'computed', 'validated', 'paid')),
    gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    has_warnings BOOLEAN NOT NULL DEFAULT FALSE,
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (payrun_id, employee_id)
);

-- 18. Payslip Lines
CREATE TABLE payslip_lines (
    id SERIAL PRIMARY KEY,
    payslip_id INTEGER NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    salary_rule_id INTEGER REFERENCES salary_rules(id) ON DELETE SET NULL,
    rule_code VARCHAR(50) NOT NULL,
    label VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 1,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Payslip Warnings
CREATE TABLE payslip_warnings (
    id SERIAL PRIMARY KEY,
    payslip_id INTEGER NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL CHECK (type IN ('missing_bank_details', 'duplicate_payslip', 'missing_contract', 'contract_expiring', 'unverified_bank', 'zero_worked_days', 'other')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_type ON employees(employee_type);
CREATE INDEX idx_contracts_emp ON contracts(employee_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_attendances_emp_date ON attendances(employee_id, check_in);
CREATE INDEX idx_timeoff_req_emp ON time_off_requests(employee_id, status);
CREATE INDEX idx_payruns_dates ON payruns(period_start, period_end);
CREATE INDEX idx_payslips_payrun ON payslips(payrun_id);
CREATE INDEX idx_payslips_emp ON payslips(employee_id);
