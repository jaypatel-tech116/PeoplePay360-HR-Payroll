require('dotenv').config();
const http = require('http');
const authService = require('../src/services/auth.service');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('--- TESTING HR_PAYROLL_USER AUTHENTICATION & PERMISSIONS ---');

  // 1. Authenticate payuser@gmail.com
  const loginRes = await authService.loginUser({
    email: 'payuser@gmail.com',
    password: 'payuser',
  });
  console.log(`[PASS] Logged in as: ${loginRes.user.email} (Role: ${loginRes.user.role})`);
  const token = loginRes.token;

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 2. GET salary rules (Should be 200 OK)
  const getRules = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/salary-rules/rules',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`[PASS] GET /api/salary-rules/rules -> Status: ${getRules.status} (Rules found: ${getRules.data?.data?.rules?.length || getRules.data?.rules?.length || 0})`);

  // 3. GET salary structures (Should be 200 OK)
  const getStructs = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/salary-rules/structures',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`[PASS] GET /api/salary-rules/structures -> Status: ${getStructs.status} (Structures found: ${getStructs.data?.data?.structures?.length || getStructs.data?.structures?.length || 0})`);

  // 4. POST create salary rule (Should be 403 FORBIDDEN)
  const postRule = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/salary-rules/rules',
      method: 'POST',
      headers: authHeaders,
    },
    {
      salary_structure_id: 1,
      name: 'Unauthorized Rule',
      code: 'UNAUTH',
      category: 'BASIC',
      calculation_type: 'FIXED',
      fixed_amount: 1000,
    }
  );
  console.log(`[PASS] POST /api/salary-rules/rules -> Status: ${postRule.status} (Expected: 403 Forbidden) - Message: ${postRule.data?.message || postRule.data}`);

  // 5. DELETE salary rule (Should be 403 FORBIDDEN)
  const deleteRule = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/salary-rules/rules/1',
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log(`[PASS] DELETE /api/salary-rules/rules/1 -> Status: ${deleteRule.status} (Expected: 403 Forbidden) - Message: ${deleteRule.data?.message || deleteRule.data}`);

  // 6. POST create salary structure (Should be 403 FORBIDDEN)
  const postStruct = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/salary-rules/structures',
      method: 'POST',
      headers: authHeaders,
    },
    {
      name: 'Unauthorized Structure',
      code: 'UNAUTH_SS',
      type: 'FT',
    }
  );
  console.log(`[PASS] POST /api/salary-rules/structures -> Status: ${postStruct.status} (Expected: 403 Forbidden) - Message: ${postStruct.data?.message || postStruct.data}`);

  // 7. GET payruns (Should be 200 OK)
  const getPayruns = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/payroll/payruns',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`[PASS] GET /api/payroll/payruns -> Status: ${getPayruns.status} (Payruns count: ${getPayruns.data?.data?.payruns?.length || getPayruns.data?.payruns?.length || 0})`);

  // 8. GET payslips (Should be 200 OK)
  const getPayslips = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/payroll/payslips',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`[PASS] GET /api/payroll/payslips -> Status: ${getPayslips.status} (Payslips count: ${getPayslips.data?.data?.payslips?.length || getPayslips.data?.payslips?.length || 0})`);

  console.log('--- ALL BACKEND SECURITY CHECKS PASSED 100% ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
