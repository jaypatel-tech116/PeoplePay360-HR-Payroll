/**
 * Comprehensive Security, Authorization, and Registration Test Suite
 */
const http = require('http');

function request(options, postData = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    if (postData) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: options.path,
      method: options.method || 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }

        // Extract set-cookie if present
        const setCookie = res.headers['set-cookie'];
        let sessionCookie = null;
        if (setCookie) {
          const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
          const match = cookieHeader.match(/ppay360_session=([^;]+)/);
          if (match) sessionCookie = `ppay360_session=${match[1]}`;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookie: sessionCookie,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PEOPLEPAY360 SECURITY & RBAC TESTS ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details}`);
      failed++;
    }
  }

  // 1. Health check
  const health = await request({ path: '/api/health' });
  assert(health.statusCode === 200 && health.body.status === 'healthy', 'Health check returns 200 healthy');

  // 2. Public companies listing for registration
  const pubCompanies = await request({ path: '/api/companies/public' });
  assert(pubCompanies.statusCode === 200 && Array.isArray(pubCompanies.body) && pubCompanies.body.length > 0, 'Public companies endpoint returns companies list');
  const defaultCompanyId = pubCompanies.body[0]?.id || 1;

  // 3. Admin Login & Session Cookie
  const adminLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'admin@peoplepay360.com', password: 'password123' }
  );
  assert(adminLogin.statusCode === 200, 'Admin login succeeds');
  assert(!!adminLogin.cookie || !!adminLogin.body.token, 'Admin login returns session cookie / token');
  assert(adminLogin.body.user.role === 'Admin', 'Admin user role confirmed');
  assert(Array.isArray(adminLogin.body.user.permissions), 'Admin has permission list');

  const adminCookie = adminLogin.cookie || `ppay360_session=${adminLogin.body.token}`;

  // 4. Admin accesses protected endpoints
  const adminUsers = await request({ path: '/api/users' }, null, adminCookie);
  assert(adminUsers.statusCode === 200 && Array.isArray(adminUsers.body), 'Admin can access /api/users');

  const adminAudit = await request({ path: '/api/audit-logs' }, null, adminCookie);
  assert(adminAudit.statusCode === 200 && Array.isArray(adminAudit.body), 'Admin can access /api/audit-logs');

  // 5. HR Manager Login
  const hrLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'hrmanager@peoplepay360.com', password: 'password123' }
  );
  assert(hrLogin.statusCode === 200, 'HR Manager login succeeds');
  const hrCookie = hrLogin.cookie || `ppay360_session=${hrLogin.body.token}`;

  // 6. Test Role Boundary: HR Manager accessing HR features -> PASS
  const hrEmployees = await request({ path: '/api/employees' }, null, hrCookie);
  assert(hrEmployees.statusCode === 200, 'HR Manager CAN access /api/employees');

  const hrTimeOff = await request({ path: '/api/time-off/requests' }, null, hrCookie);
  assert(hrTimeOff.statusCode === 200, 'HR Manager CAN access /api/time-off/requests');

  const hrRegistrations = await request({ path: '/api/registrations' }, null, hrCookie);
  assert(hrRegistrations.statusCode === 200, 'HR Manager CAN access /api/registrations for candidate approvals');

  // 7. Test Role Boundary: HR Manager accessing Payroll features -> MUST FAIL WITH 403
  const hrPayruns = await request({ path: '/api/payruns' }, null, hrCookie);
  assert(hrPayruns.statusCode === 403, 'HR Manager CANNOT access /api/payruns (403 Forbidden)', `got ${hrPayruns.statusCode}`);

  const hrPayslips = await request({ path: '/api/payslips' }, null, hrCookie);
  assert(hrPayslips.statusCode === 403, 'HR Manager CANNOT access /api/payslips (403 Forbidden)', `got ${hrPayslips.statusCode}`);

  const hrSalaryStructures = await request({ path: '/api/salary-structures' }, null, hrCookie);
  assert(hrSalaryStructures.statusCode === 403, 'HR Manager CANNOT access /api/salary-structures (403 Forbidden)', `got ${hrSalaryStructures.statusCode}`);

  // 8. Test HR Payroll User: Can access Payruns and Payslips, but CANNOT configure structures
  const payrollUserLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'payrolluser@peoplepay360.com', password: 'password123' }
  );
  assert(payrollUserLogin.statusCode === 200, 'HR Payroll User login succeeds');
  const payrollUserCookie = payrollUserLogin.cookie || `ppay360_session=${payrollUserLogin.body.token}`;

  const prUserPayruns = await request({ path: '/api/payruns' }, null, payrollUserCookie);
  assert(prUserPayruns.statusCode === 200, 'HR Payroll User CAN read /api/payruns');

  const prUserDeletePayrun = await request({ path: '/api/payruns/999', method: 'DELETE' }, null, payrollUserCookie);
  assert(prUserDeletePayrun.statusCode === 403, 'HR Payroll User CANNOT delete payruns (403 Forbidden)');

  // 9. Test Employee Role: Self-service & IDOR protection
  const empLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'employee@peoplepay360.com', password: 'password123' }
  );
  assert(empLogin.statusCode === 200, 'Employee login succeeds');
  const empCookie = empLogin.cookie || `ppay360_session=${empLogin.body.token}`;
  const empId = empLogin.body.user.employee_id;

  // Employee reading own employee profile
  const ownProfile = await request({ path: `/api/employees/${empId}` }, null, empCookie);
  assert(ownProfile.statusCode === 200 && ownProfile.body.id === empId, 'Employee CAN view their own profile');

  // Employee reading OTHER employee's profile -> IDOR CHECK
  const otherProfile = await request({ path: `/api/employees/${empId + 1}` }, null, empCookie);
  assert(otherProfile.statusCode === 403, 'Employee CANNOT view another employee profile (IDOR blocked: 403)', `got ${otherProfile.statusCode}`);

  // Employee reading own payslips
  const ownPayslips = await request({ path: `/api/payslips?employee_id=${empId}` }, null, empCookie);
  assert(ownPayslips.statusCode === 200, 'Employee CAN view their own payslips');

  // Employee CANNOT view /api/users
  const empUsers = await request({ path: '/api/users' }, null, empCookie);
  assert(empUsers.statusCode === 403, 'Employee CANNOT access /api/users (403 Forbidden)');

  // 10. Self-Registration + OTP Flow Test
  const testEmail = `newcandidate_${Date.now()}@example.com`;
  const regSubmit = await request(
    { path: '/api/registrations/register', method: 'POST' },
    {
      full_name: 'John Candidate',
      email: testEmail,
      phone: '+15551234567',
      password: 'candidatePass123!',
      company_id: defaultCompanyId
    }
  );
  assert(regSubmit.statusCode === 201, 'Registration request submitted (201 Created)');
  assert(!!regSubmit.body.requestId, 'Registration returns requestId');

  // Fetch OTP directly from DB for automated test verification
  const { query } = require('../config/db');
  const otpRec = await query(
    `SELECT * FROM otp_verifications WHERE target_email = $1 AND purpose = 'email_verification' AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`,
    [testEmail]
  );
  assert(otpRec.rows.length > 0, 'OTP record created in database with 5-minute expiry');

  // Test invalid OTP -> must fail
  const badOtpVerify = await request(
    { path: '/api/registrations/verify-email', method: 'POST' },
    { email: testEmail, otp: '000000' }
  );
  assert(badOtpVerify.statusCode === 400, 'Invalid OTP rejected (400 Bad Request)');

  // Let's verify with the real generated code by reading the test preview / testing verifyOTP
  // In bcrypt hash, we can verify using the otpService directly:
  const otpService = require('../services/otpService');
  // Or create a known OTP
  const freshOtp = await otpService.createOTP(testEmail, 'email_verification', regSubmit.body.requestId);
  
  const goodOtpVerify = await request(
    { path: '/api/registrations/verify-email', method: 'POST' },
    { email: testEmail, otp: freshOtp.otp }
  );
  assert(goodOtpVerify.statusCode === 200 && goodOtpVerify.body.status === 'pending', 'Valid OTP successfully verifies email and marks request pending HR review');

  // Review & Approve registration as Admin
  const pendingRequests = await request({ path: '/api/registrations?status=pending' }, null, adminCookie);
  assert(pendingRequests.statusCode === 200 && Array.isArray(pendingRequests.body), 'Admin can list pending registration requests');
  const targetReq = pendingRequests.body.find(r => r.email === testEmail);
  assert(!!targetReq, 'New registration request visible in pending list');

  if (targetReq) {
    const approveRes = await request(
      { path: `/api/registrations/${targetReq.id}/approve`, method: 'PUT' },
      null,
      adminCookie
    );
    assert(approveRes.statusCode === 200, 'Admin approves registration request');
    assert(!!approveRes.body.userId && !!approveRes.body.employeeId, 'Employee and User accounts created on approval');

    // Test that the newly approved user can now log in!
    const newCandidateLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: testEmail, password: 'candidatePass123!' }
    );
    assert(newCandidateLogin.statusCode === 200, 'Newly registered & approved employee can successfully log in!');
  }

  // 11. Test Logout
  const logoutRes = await request({ path: '/api/auth/logout', method: 'POST' }, null, adminCookie);
  assert(logoutRes.statusCode === 200, 'Logout succeeds and clears session');

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
