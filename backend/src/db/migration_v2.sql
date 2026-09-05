-- PeoplePay360 Migration V2: Security & Multi-Company Foundation
-- Non-destructive: only adds new tables and alters existing ones.
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS checks).

-- ============================================================
-- 1. COMPANIES TABLE (Multi-tenant root)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. REGISTRATION REQUESTS (Approval workflow)
-- ============================================================
CREATE TABLE IF NOT EXISTS registration_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    department_id INTEGER REFERENCES departments(id),
    job_position_id INTEGER REFERENCES job_positions(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'refused', 'email_verification', 'completed')),
    refusal_reason TEXT,
    decided_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. OTP VERIFICATIONS (Hashed OTP with purpose isolation)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    target_email VARCHAR(150) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL
        CHECK (purpose IN ('registration_approval', 'email_verification', 'login', 'password_reset')),
    reference_id INTEGER,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    resend_count INTEGER NOT NULL DEFAULT 0,
    max_resends INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. USER SESSIONS (Database-backed sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. ROLE PERMISSIONS (Permission matrix)
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    UNIQUE (role_id, module, action)
);

-- ============================================================
-- 6. AUDIT LOGS (Immutable audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. ALTER EXISTING TABLES: Add company_id columns
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='company_id') THEN
        ALTER TABLE departments ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='company_id') THEN
        ALTER TABLE employees ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company_id') THEN
        ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salary_structures' AND column_name='company_id') THEN
        ALTER TABLE salary_structures ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='time_off_types' AND column_name='company_id') THEN
        ALTER TABLE time_off_types ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='working_schedules' AND column_name='company_id') THEN
        ALTER TABLE working_schedules ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payruns' AND column_name='company_id') THEN
        ALTER TABLE payruns ADD COLUMN company_id INTEGER REFERENCES companies(id);
    END IF;
END $$;

-- ============================================================
-- 8. CREATE INDEXES for new columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_payruns_company ON payruns(company_id);
CREATE INDEX IF NOT EXISTS idx_salary_structures_company ON salary_structures(company_id);
CREATE INDEX IF NOT EXISTS idx_time_off_types_company ON time_off_types(company_id);
CREATE INDEX IF NOT EXISTS idx_working_schedules_company ON working_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_hash ON user_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_verifications(target_email, purpose);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_reg_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_reg_requests_company ON registration_requests(company_id);
