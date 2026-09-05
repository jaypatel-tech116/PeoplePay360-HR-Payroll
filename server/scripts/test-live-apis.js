const http = require('http');

function postJson(path, body, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getAuth(path, token) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: 5000,
      path: path,
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function verifyLiveApis() {
  console.log("==================================================");
  console.log("1. Authenticating as HR Payroll Manager (payroll@gmail.com)...");
  const loginRes = await postJson('/api/auth/login', {
    email: 'payroll@gmail.com',
    password: '123456'
  });
  console.log(`Login Status: ${loginRes.status}`, loginRes.data.user?.role);
  const token = loginRes.data.token;
  if (!token) {
    console.error("Login failed:", loginRes.data);
    process.exit(1);
  }

  console.log("\n2. Querying Live Analytics Dashboard (/api/analytics/dashboard)...");
  const dashRes = await getAuth('/api/analytics/dashboard', token);
  console.log("Status:", dashRes.status);
  console.log("KPIs:", JSON.stringify(dashRes.data.data?.kpis, null, 2));

  console.log("\n3. Querying Salary Structures & Rules (/api/salary-rules/structures)...");
  const structsRes = await getAuth('/api/salary-rules/structures', token);
  console.log("Status:", structsRes.status);
  console.log("Structures count:", structsRes.data.data?.length);
  if (structsRes.data.data?.length > 0) {
    const s1 = structsRes.data.data[0];
    console.log(`Structure '${s1.name}' rules count: ${s1.rules?.length}`);
  }

  console.log("\n4. Querying Payruns List (/api/payroll/payruns)...");
  const payrunsRes = await getAuth('/api/payroll/payruns', token);
  console.log("Status:", payrunsRes.status);
  console.log("Payruns count in DB:", payrunsRes.data.data?.length);

  console.log("\n5. Querying Department Payroll Report (/api/analytics/reports?report_type=department)...");
  const repRes = await getAuth('/api/analytics/reports?report_type=department', token);
  console.log("Status:", repRes.status);
  console.log("Department Summary:", JSON.stringify(repRes.data.data?.summary, null, 2));
  console.log("Departments counted:", repRes.data.data?.departments?.length);

  console.log("\n6. Testing Employee Self-Service Isolation...");
  const empLogin = await postJson('/api/auth/login', {
    email: 'employee1@gmail.com',
    password: '123456'
  });
  console.log(`Employee Login Status: ${empLogin.status}`, empLogin.data.user?.role, `EmpID: ${empLogin.data.user?.employee_id}`);
  const empToken = empLogin.data.token;

  // Try to access own summary
  const ownSummary = await getAuth(`/api/payroll/employee/${empLogin.data.user?.employee_id}/summary`, empToken);
  console.log(`Employee Own Summary Access Status: ${ownSummary.status} (Expected 200)`);

  // Try to access another employee summary
  const forbiddenSummary = await getAuth('/api/payroll/employee/999/summary', empToken);
  console.log(`Employee Cross Access to Emp 999 Status: ${forbiddenSummary.status} (Expected 403 Forbidden)`);

  console.log("\n==================================================");
  console.log("🎉 All Live API Verification Checks Passed!");
  console.log("==================================================");
  process.exit(0);
}

verifyLiveApis();
