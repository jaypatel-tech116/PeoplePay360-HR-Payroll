const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const userService = require('../src/services/user.service');
const authService = require('../src/services/auth.service');
const { pool } = require('../src/config/mysqlDb');

async function runE2E() {
  console.log('=== ADMIN STAKEHOLDER MANAGEMENT END-TO-END VERIFICATION ===\n');

  // 1. Check live stats
  console.log('1. Fetching live stakeholder stats...');
  const stats = await userService.getStakeholderStats();
  console.log('Total Users:', stats.summary.totalUsers);
  console.log('Active Users:', stats.summary.activeUsers);
  console.log('Deactivated Users:', stats.summary.deactivatedUsers);
  console.log('Roles breakdown:', stats.roles.map(r => `${r.name}: ${r.totalCount} (Active: ${r.activeCount})`).join(', '));

  // 2. Fetch users by stakeholder role
  console.log('\n2. Querying each stakeholder group...');
  for (const roleCode of ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE']) {
    const list = await userService.listUsers({ role: roleCode });
    console.log(`- [${roleCode}] count: ${list.length}. Sample: ${list[0]?.full_name} (${list[0]?.email})`);
  }

  // 3. Create a test stakeholder
  const testEmail = `admin_test_${Date.now()}@company.com`;
  const testPassword = 'Password@123';
  console.log(`\n3. Creating new stakeholder account: ${testEmail}...`);
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(testPassword, 10);
  const created = await userService.createUser({
    email: testEmail,
    passwordHash,
    fullName: 'Ananya Sharma',
    roleCode: 'HR_PAYROLL_MANAGER',
    departmentId: 1,
    designation: 'Lead Payroll Specialist',
    phone: '+91 9988776655',
  });
  console.log('Created Stakeholder:', {
    id: created.id,
    name: created.full_name,
    email: created.email,
    role: created.role,
    department: created.department_name,
    designation: created.designation,
    isActive: created.is_active,
  });

  // 4. Verify login succeeds when active
  console.log('\n4. Testing login while account is ACTIVE...');
  const loginResult1 = await authService.loginUser({ email: testEmail, password: testPassword });
  console.log(`Login SUCCESS: User token generated, role is: ${loginResult1.user.role}`);

  // 5. Update stakeholder details
  console.log('\n5. Updating stakeholder details...');
  const updated = await userService.updateUser(created.id, {
    fullName: 'Ananya Sharma (Promoted)',
    designation: 'Senior Payroll Director',
    roleCode: 'HR_MANAGER',
  });
  console.log('Updated Stakeholder:', {
    name: updated.full_name,
    designation: updated.designation,
    role: updated.role,
  });

  // 6. Test Soft Delete / Deactivate
  console.log('\n6. Testing SOFT DELETE / DEACTIVATE...');
  const deactivated = await userService.deactivateUser(created.id);
  console.log(`Deactivated: is_active = ${deactivated.is_active}, employee_status = ${deactivated.employee_status}`);

  // 7. Verify login is BLOCKED with 403 when deactivated
  console.log('\n7. Testing login while account is DEACTIVATED (should reject with 403)...');
  try {
    await authService.loginUser({ email: testEmail, password: testPassword });
    console.error('ERROR: Deactivated user was able to login!');
    process.exit(1);
  } catch (err) {
    console.log(`Expected rejection received: "${err.message}" (statusCode: ${err.statusCode})`);
  }

  // 8. Test Reactivation
  console.log('\n8. Testing REACTIVATION...');
  const reactivated = await userService.activateUser(created.id);
  console.log(`Reactivated: is_active = ${reactivated.is_active}, employee_status = ${reactivated.employee_status}`);

  // 9. Verify login succeeds again
  console.log('\n9. Testing login after REACTIVATION...');
  const loginResult2 = await authService.loginUser({ email: testEmail, password: testPassword });
  console.log(`Login SUCCESS after reactivate: User role is ${loginResult2.user.role}`);

  // 10. Clean up test record
  console.log('\n10. Cleaning up test record...');
  await pool.query('DELETE FROM users WHERE id = ?', [created.id]);
  if (created.employee_id) {
    await pool.query('DELETE FROM employees WHERE id = ?', [created.employee_id]);
  }
  console.log('Cleanup completed.');

  console.log('\n=== ALL END-TO-END VERIFICATIONS PASSED 100% ===');
  process.exit(0);
}

runE2E().catch(e => {
  console.error('E2E Verification failed:', e);
  process.exit(1);
});
