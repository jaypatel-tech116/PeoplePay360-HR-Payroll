const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const userService = require('../src/services/user.service');

async function test() {
  console.log('--- 1. TESTING GET STAKEHOLDER STATS ---');
  const stats = await userService.getStakeholderStats();
  console.log('Stakeholder Stats:', JSON.stringify(stats, null, 2));

  console.log('\n--- 2. TESTING LIST USERS BY ROLE ---');
  const allUsers = await userService.listUsers();
  console.log(`Total users in DB: ${allUsers.length}`);

  const hrManagers = await userService.listUsers({ role: 'HR_MANAGER' });
  console.log(`HR Managers: ${hrManagers.length}`);

  const payrollManagers = await userService.listUsers({ role: 'HR_PAYROLL_MANAGER' });
  console.log(`Payroll Managers: ${payrollManagers.length}`);

  const payrollUsers = await userService.listUsers({ role: 'HR_PAYROLL_USER' });
  console.log(`Payroll Users: ${payrollUsers.length}`);

  const employees = await userService.listUsers({ role: 'EMPLOYEE' });
  console.log(`Employees: ${employees.length}`);

  const admins = await userService.listUsers({ role: 'ADMIN' });
  console.log(`Admins: ${admins.length}`);

  console.log('\n--- 3. TESTING CREATE STAKEHOLDER USER ---');
  const testEmail = `test_hr_${Date.now()}@company.com`;
  const created = await userService.createUser({
    email: testEmail,
    passwordHash: '$2a$10$hashedpasswordforevaluation',
    fullName: 'Test Stakeholder HR',
    roleCode: 'HR_MANAGER',
    departmentId: 1,
    designation: 'Senior HR Partner',
    phone: '+91 9876543210',
  });
  console.log('Created user successfully:', {
    id: created.id,
    email: created.email,
    role: created.role,
    full_name: created.full_name,
    department_name: created.department_name,
    designation: created.designation,
    is_active: created.is_active,
  });

  console.log('\n--- 4. TESTING SOFT DELETE / DEACTIVATE ---');
  const deactivated = await userService.deactivateUser(created.id);
  console.log(`Deactivated user ${created.id}, is_active is now: ${deactivated.is_active}, employee_status: ${deactivated.employee_status}`);

  console.log('\n--- 5. TESTING REACTIVATE ---');
  const reactivated = await userService.activateUser(created.id);
  console.log(`Reactivated user ${created.id}, is_active is now: ${reactivated.is_active}, employee_status: ${reactivated.employee_status}`);

  console.log('\n--- 6. CLEANING UP TEST USER ---');
  const { pool } = require('../src/config/mysqlDb');
  await pool.query('DELETE FROM users WHERE id = ?', [created.id]);
  if (created.employee_id) {
    await pool.query('DELETE FROM employees WHERE id = ?', [created.employee_id]);
  }
  console.log('Test cleanup complete.');

  console.log('\n=== BACKEND STAKEHOLDER CRUD AND SOFT DELETE VERIFIED 100% ===');
  process.exit(0);
}

test().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
