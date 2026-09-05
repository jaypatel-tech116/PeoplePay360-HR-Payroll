-- ============================================================================
-- PeoplePay360 Migration: 01_payroll_constraints_and_indexes.sql
-- Compatible with PostgreSQL 14+ / Supabase
-- ============================================================================

-- 1. Prevent duplicate active payslips for the same employee within the same payroll period
CREATE UNIQUE INDEX IF NOT EXISTS idx_payslips_emp_period 
ON public.payslips (employee_id, period_start, period_end);

-- 2. Performance Composite Indexes for Payroll Queries
CREATE INDEX IF NOT EXISTS idx_contracts_emp_dates_status 
ON public.contracts (employee_id, start_date, end_date, status);

CREATE INDEX IF NOT EXISTS idx_attendance_emp_date_status 
ON public.attendance (employee_id, attendance_date, status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_emp_dates_status 
ON public.leave_requests (employee_id, start_date, end_date, status);

CREATE INDEX IF NOT EXISTS idx_payruns_period_status 
ON public.payruns (period_start, period_end, status);

CREATE INDEX IF NOT EXISTS idx_salary_rules_structure_seq 
ON public.salary_rules (salary_structure_id, sequence ASC);

CREATE INDEX IF NOT EXISTS idx_payslip_lines_payslip_seq 
ON public.payslip_lines (payslip_id, sequence ASC);

-- 3. Check Constraints for Financial & Date Safety
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_contracts_positive_wage'
    ) THEN
        ALTER TABLE public.contracts ADD CONSTRAINT chk_contracts_positive_wage CHECK (wage >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_payrun_valid_period'
    ) THEN
        ALTER TABLE public.payruns ADD CONSTRAINT chk_payrun_valid_period CHECK (period_end >= period_start);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_payslip_valid_period'
    ) THEN
        ALTER TABLE public.payslips ADD CONSTRAINT chk_payslip_valid_period CHECK (period_end >= period_start);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_payslip_amounts'
    ) THEN
        ALTER TABLE public.payslips ADD CONSTRAINT chk_payslip_amounts CHECK (gross_amount >= 0 AND deduction_amount >= 0 AND net_amount >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_leave_allocation_balance'
    ) THEN
        ALTER TABLE public.leave_allocations ADD CONSTRAINT chk_leave_allocation_balance CHECK (used_days >= 0 AND used_days <= total_days);
    END IF;
END $$;
