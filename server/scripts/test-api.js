const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("🧪 Starting PeoplePay360 Backend API Test Suite...\n");

  let passed = 0;
  let failed = 0;

  async function test(title, fn) {
    try {
      await fn();
      console.log(`  ✅ ${title}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ ${title}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test("GET /api/health", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || "Failed");
  });

  // 2. Auth: Admin Login
  let adminToken = "";
  await test("POST /api/auth/login (Admin: admin@gmail.com / admin)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@gmail.com", password: "admin" }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data?.token) {
      throw new Error(json.message || "Login failed");
    }
    adminToken = json.data.token;
  });

  // 3. Auth: HR Login
  let hrToken = "";
  await test("POST /api/auth/login (HR: hr@gmail.com / hrhr)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hr@gmail.com", password: "hrhr" }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data?.token) {
      throw new Error(json.message || "Login failed");
    }
    hrToken = json.data.token;
  });

  // 4. Auth: Employee Login
  let empToken = "";
  await test("POST /api/auth/login (Employee: employee@gmail.com / 123456)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "employee@gmail.com", password: "123456" }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data?.token) {
      throw new Error(json.message || "Login failed");
    }
    empToken = json.data.token;
  });

  // Helper with Admin Auth
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  };

  // 5. Auth Me
  await test("GET /api/auth/me", async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
  });

  // 6. Departments
  await test("GET /api/departments (All 8 depts with live employee counts)", async () => {
    const res = await fetch(`${BASE_URL}/departments`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data?.departments || json.data.departments.length < 8) {
      throw new Error(json.message || `Expected at least 8 departments, got ${json.data?.departments?.length}`);
    }
  });

  // 7. Schedules
  await test("GET /api/schedules (Working schedules)", async () => {
    const res = await fetch(`${BASE_URL}/schedules`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data?.schedules) throw new Error(json.message || "Failed to fetch schedules");
  });

  // 8. Employees
  await test("GET /api/employees (Employee directory with EMP001-EMP008)", async () => {
    const res = await fetch(`${BASE_URL}/employees`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data?.employees || json.data.employees.length < 8) {
      throw new Error(json.message || `Expected at least 8 employees, got ${json.data?.employees?.length}`);
    }
  });

  // 9. Employee Details with 6 tabs
  await test("GET /api/employees/1 (Full profile + contracts + attendance + leaves + payslips)", async () => {
    const res = await fetch(`${BASE_URL}/employees/1`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data?.employee || !json.data.employee.contracts) {
      throw new Error(json.message || "Failed to fetch full employee profile tabs");
    }
  });

  // 10. Contracts
  await test("GET /api/contracts (Contracts with status counts)", async () => {
    const res = await fetch(`${BASE_URL}/contracts`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data?.contracts || !json.data.counts) {
      throw new Error(json.message || "Failed to fetch contracts and count pills");
    }
  });

  // 11. Attendance
  await test("GET /api/attendance (Attendance logs & 4 KPI metrics)", async () => {
    const res = await fetch(`${BASE_URL}/attendance`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data.attendance || !json.data.kpi) {
      throw new Error("Failed to fetch attendance logs or KPIs");
    }
  });

  // 12. Time Off Requests
  await test("GET /api/leaves/requests (Leave requests & status counts)", async () => {
    const res = await fetch(`${BASE_URL}/leaves/requests`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data.requests || !json.data.counts) {
      throw new Error("Failed to fetch leave requests or count pills");
    }
  });

  // 13. Salary Structures & Rules
  await test("GET /api/salary-rules/structures & /rules", async () => {
    const res1 = await fetch(`${BASE_URL}/salary-rules/structures`, { headers: authHeaders });
    const json1 = await res1.json();
    const res2 = await fetch(`${BASE_URL}/salary-rules/rules`, { headers: authHeaders });
    const json2 = await res2.json();
    if (!res1.ok || !res2.ok || !json1.data.structures || !json2.data.rules) {
      throw new Error("Failed to fetch salary structures or rules");
    }
  });

  // 14. Payruns & Payslips
  await test("GET /api/payroll/payruns & /payslips", async () => {
    const res1 = await fetch(`${BASE_URL}/payroll/payruns`, { headers: authHeaders });
    const json1 = await res1.json();
    const res2 = await fetch(`${BASE_URL}/payroll/payslips`, { headers: authHeaders });
    const json2 = await res2.json();
    if (!res1.ok || !res2.ok || !json1.data.payruns || !json2.data.payslips) {
      throw new Error("Failed to fetch payruns or payslips");
    }
  });

  // 15. Admin Analytics
  await test("GET /api/analytics/admin (4 KPIs, leave chart, recent activities)", async () => {
    const res = await fetch(`${BASE_URL}/analytics/admin`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data.kpi || !json.data.recentActivities) {
      throw new Error("Failed to fetch admin analytics");
    }
  });

  // 16. Audit Logs
  await test("GET /api/audit-logs", async () => {
    const res = await fetch(`${BASE_URL}/audit-logs`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data.logs) throw new Error("Failed to fetch audit logs");
  });

  // 17. MySQL Database Analysis
  await test("GET /api/db/analysis (16 MySQL tables compliance check)", async () => {
    const res = await fetch(`${BASE_URL}/db/analysis`, { headers: authHeaders });
    const json = await res.json();
    if (!res.ok || !json.data.isFullyCompliant) {
      throw new Error(`Database compliance check failed: ${json.data?.totalExistingTables} / 16 tables`);
    }
  });

  console.log(`\n==============================================`);
  console.log(`🎯 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
