/**
 * Seed Role Permissions
 * Populates the role_permissions table with the complete permission matrix.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 */
const { pool } = require('../config/db');

// Full permission matrix from the implementation plan
const PERMISSION_MATRIX = {
  'Employee': [
    ['employees', 'read_own'],
    ['attendance', 'read_own'],
    ['attendance', 'create_own'],
    ['time_off', 'read_own'],
    ['time_off', 'create_own'],
    ['payslips', 'read_own'],
    ['payslips', 'download_own'],
  ],
  'HR Manager': [
    ['employees', 'read_own'],
    ['employees', 'read_all'],
    ['employees', 'create'],
    ['employees', 'update'],
    ['attendance', 'read_own'],
    ['attendance', 'read_all'],
    ['attendance', 'create_own'],
    ['attendance', 'correct'],
    ['time_off', 'read_own'],
    ['time_off', 'read_all'],
    ['time_off', 'create_own'],
    ['time_off', 'approve'],
    ['time_off', 'manage_types'],
    ['time_off', 'manage_allocations'],
    ['contracts', 'read'],
    ['contracts', 'create'],
    ['contracts', 'update'],
    ['schedules', 'read'],
    ['schedules', 'manage'],
    ['dashboard', 'read'],
    ['registrations', 'manage'],
    ['registrations', 'read'],
    ['registrations', 'approve'],
  ],
  'HR Payroll User': [
    ['employees', 'read_own'],
    ['employees', 'read_all'],
    ['employees', 'create'],
    ['employees', 'update'],
    ['attendance', 'read_own'],
    ['attendance', 'read_all'],
    ['attendance', 'create_own'],
    ['attendance', 'correct'],
    ['time_off', 'read_own'],
    ['time_off', 'read_all'],
    ['time_off', 'create_own'],
    ['time_off', 'approve'],
    ['time_off', 'manage_types'],
    ['time_off', 'manage_allocations'],
    ['contracts', 'read'],
    ['contracts', 'create'],
    ['contracts', 'update'],
    ['schedules', 'read'],
    ['schedules', 'manage'],
    ['payslips', 'read_own'],
    ['payslips', 'read_all'],
    ['payslips', 'download_own'],
    ['payruns', 'read'],
    ['payruns', 'create'],
    ['payruns', 'compute'],
    ['payruns', 'validate'],
    ['salary_structures', 'read'],
    ['salary_rules', 'read'],
    ['dashboard', 'read'],
  ],
  'HR Payroll Manager': [
    ['employees', 'read_own'],
    ['employees', 'read_all'],
    ['employees', 'create'],
    ['employees', 'update'],
    ['attendance', 'read_own'],
    ['attendance', 'read_all'],
    ['attendance', 'create_own'],
    ['attendance', 'correct'],
    ['time_off', 'read_own'],
    ['time_off', 'read_all'],
    ['time_off', 'create_own'],
    ['time_off', 'approve'],
    ['time_off', 'manage_types'],
    ['time_off', 'manage_allocations'],
    ['contracts', 'read'],
    ['contracts', 'create'],
    ['contracts', 'update'],
    ['schedules', 'read'],
    ['schedules', 'manage'],
    ['payslips', 'read_own'],
    ['payslips', 'read_all'],
    ['payslips', 'download_own'],
    ['payruns', 'read'],
    ['payruns', 'create'],
    ['payruns', 'compute'],
    ['payruns', 'validate'],
    ['payruns', 'mark_paid'],
    ['payruns', 'delete'],
    ['salary_structures', 'read'],
    ['salary_structures', 'manage'],
    ['salary_rules', 'read'],
    ['salary_rules', 'manage'],
    ['dashboard', 'read'],
  ],
  'Admin': [
    // Admin gets everything
    ['employees', 'read_own'],
    ['employees', 'read_all'],
    ['employees', 'create'],
    ['employees', 'update'],
    ['employees', 'delete'],
    ['attendance', 'read_own'],
    ['attendance', 'read_all'],
    ['attendance', 'create_own'],
    ['attendance', 'correct'],
    ['time_off', 'read_own'],
    ['time_off', 'read_all'],
    ['time_off', 'create_own'],
    ['time_off', 'approve'],
    ['time_off', 'manage_types'],
    ['time_off', 'manage_allocations'],
    ['contracts', 'read'],
    ['contracts', 'create'],
    ['contracts', 'update'],
    ['contracts', 'delete'],
    ['schedules', 'read'],
    ['schedules', 'manage'],
    ['payslips', 'read_own'],
    ['payslips', 'read_all'],
    ['payslips', 'download_own'],
    ['payruns', 'read'],
    ['payruns', 'create'],
    ['payruns', 'compute'],
    ['payruns', 'validate'],
    ['payruns', 'mark_paid'],
    ['payruns', 'delete'],
    ['salary_structures', 'read'],
    ['salary_structures', 'manage'],
    ['salary_rules', 'read'],
    ['salary_rules', 'manage'],
    ['users', 'read'],
    ['users', 'manage'],
    ['companies', 'manage'],
    ['audit_logs', 'read'],
    ['dashboard', 'read'],
  ]
};

async function seedPermissions() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing permissions for a clean reseed
    await client.query('DELETE FROM role_permissions');
    console.log('Cleared existing role_permissions.');

    // Get role IDs
    const rolesRes = await client.query('SELECT id, name FROM roles ORDER BY id');
    const roleMap = {};
    for (const row of rolesRes.rows) {
      roleMap[row.name] = row.id;
    }
    console.log('Found roles:', Object.keys(roleMap).join(', '));

    let insertCount = 0;
    for (const [roleName, permissions] of Object.entries(PERMISSION_MATRIX)) {
      const roleId = roleMap[roleName];
      if (!roleId) {
        console.warn(`⚠️ Role "${roleName}" not found in database, skipping.`);
        continue;
      }

      for (const [module, action] of permissions) {
        await client.query(
          `INSERT INTO role_permissions (role_id, module, action)
           VALUES ($1, $2, $3)
           ON CONFLICT (role_id, module, action) DO NOTHING`,
          [roleId, module, action]
        );
        insertCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Seeded ${insertCount} role permissions across ${Object.keys(roleMap).length} roles.`);

    // Verify counts per role
    const verifyRes = await client.query(`
      SELECT r.name, COUNT(rp.id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name
      ORDER BY r.id
    `);
    console.log('\nPermission counts per role:');
    for (const row of verifyRes.rows) {
      console.log(`  ${row.name}: ${row.permission_count} permissions`);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed permissions failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedPermissions().catch(() => process.exit(1));
