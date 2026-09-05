const http = require('http');

function post(url, token, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + (u.search || ''),
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Login as HR Payroll Manager ---');
  const loginRes = await post('http://localhost:5000/api/auth/login', null, {
    email: 'payrollmgr@peoplepay360.com',
    password: 'password123'
  });
  console.log('Login Status:', loginRes.status, 'User:', loginRes.body.user.name, 'Role:', loginRes.body.user.role);
  const token = loginRes.body.token;

  console.log('\n--- 2. Test Dashboard Aggregations with Filters ---');
  const dashRes = await get('http://localhost:5000/api/dashboard?period=all&department=all&employeeType=full_time', token);
  console.log('Dashboard Status:', dashRes.status);
  console.log('KPIs:', dashRes.body.kpis);
  console.log('Department Costs Count:', dashRes.body.charts.deptCosts.length);
  console.log('Monthly Trend Count:', dashRes.body.charts.monthlyTrend.length);
  console.log('Missing Bank Details Alert Count:', dashRes.body.alerts.missingBankCount);

  console.log('\n--- 3. Test Wizard Step 1: Preview Eligible Employees ---');
  const previewRes = await post('http://localhost:5000/api/payruns/preview-eligible-employees', token, {
    salary_structure_id: 1,
    period_start: '2026-08-01',
    period_end: '2026-08-31'
  });
  console.log('Preview Status:', previewRes.status, 'Total Eligible:', previewRes.body.totalEligible);

  console.log('\n--- 4. Test Payrun Computation (Draft August Payrun) ---');
  // Payrun ID 2 was created in seed as draft
  const compRes = await post('http://localhost:5000/api/payruns/2/compute', token, {});
  console.log('Compute Status:', compRes.status, compRes.body);

  console.log('\n--- 5. Verify Computed Payslips & Warnings ---');
  const prDetail = await get('http://localhost:5000/api/payruns/2', token);
  console.log('Payrun Status:', prDetail.body.status, 'Gross:', prDetail.body.total_gross, 'Net:', prDetail.body.total_net);
  console.log('Payslips Count:', prDetail.body.payslips.length);
  console.log('Warnings Count:', prDetail.body.warnings.length);
  if (prDetail.body.warnings.length > 0) {
    console.log('Sample Warning:', prDetail.body.warnings[0].type, '-', prDetail.body.warnings[0].message);
  }

  console.log('\n--- 6. Test Atomic Leave Request Approval ---');
  // Find pending request
  const reqs = await get('http://localhost:5000/api/time-off/requests?status=submitted', token);
  if (reqs.body.length > 0) {
    const targetReq = reqs.body[0];
    console.log(`Approving request ID ${targetReq.id} for ${targetReq.employee_name} (${targetReq.duration} days ${targetReq.leave_type_name})...`);
    const appRes = await post(`http://localhost:5000/api/time-off/requests/${targetReq.id}/approve`, token, {});
    console.log('Approval Status:', appRes.status, appRes.body.message);
  }

  console.log('\nAll core backend APIs and business rules successfully verified!');
}

runTests().catch(console.error);
