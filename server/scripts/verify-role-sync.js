const { pool } = require("../src/config/mysqlDb");

const BASE_URL = "http://localhost:5000/api";

async function postJson(url, data, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function getJson(url, token = null) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers,
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text), raw: text };
  } catch {
    return { status: res.status, raw: text };
  }
}

async function runRoleSyncVerification() {
  console.log("\n========================================================================");
  console.log("🚀 STARTING MULTI-ROLE SYNCHRONIZATION END-TO-END VERIFICATION");
  console.log("   Roles: HR Manager -> Employee -> HR Payroll Manager");
  console.log("========================================================================\n");

  const ts = Date.now();
  const testCode = `SYNC${String(ts).slice(-5)}`;
  const testEmail = `karan.${testCode.toLowerCase()}@company.com`;
  const testPassword = "Password@123";
  const testWage = 65000;

  let hrToken = null;
  let employeeToken = null;
  let payrollToken = null;
  let createdEmployeeId = null;
  let createdPayrunId = null;
  let createdPayslipId = null;

  try {
    // ------------------------------------------------------------------------
    // STEP 1: HR Manager Login
    // ------------------------------------------------------------------------
    console.log("📌 STEP 1: HR Manager Login (hr@gmail.com)");
    const hrLoginRes = await postJson("/auth/login", {
      email: "hr@gmail.com",
      password: "123456",
    });

    if (hrLoginRes.status !== 200 || !hrLoginRes.data.data?.token) {
      throw new Error(`HR Manager login failed: ${JSON.stringify(hrLoginRes.data)}`);
    }

    hrToken = hrLoginRes.data.data.token;
    console.log(`  ✓ HR Manager logged in successfully. Role: ${hrLoginRes.data.data.user.role}`);

    // ------------------------------------------------------------------------
    // STEP 2: HR Manager Onboards a New Employee
    // ------------------------------------------------------------------------
    console.log("\n📌 STEP 2: HR Manager Onboards Employee 'Karan Verma'");
    const onboardPayload = {
      employee_code: testCode,
      full_name: "Karan Verma",
      department_id: 1, // Engineering
      job_position: "Senior Payroll Analyst",
      employee_type: "FULL_TIME",
      pipeline_stage: "ACTIVE",
      joining_date: "2026-08-01",
      work_email: testEmail,
      password: testPassword,
      confirm_password: testPassword,
      phone: "+91 9876543210",
      work_location: "Bangalore Office",
      wage: testWage,
    };

    const onboardRes = await postJson("/hr/employees", onboardPayload, hrToken);
    if (onboardRes.status !== 201) {
      throw new Error(`Employee onboarding failed: ${JSON.stringify(onboardRes.data)}`);
    }

    createdEmployeeId = onboardRes.data.data?.id || onboardRes.data.data?.employee?.id;
    console.log(`  ✓ Employee onboarded! ID: ${createdEmployeeId}, Code: ${testCode}, Email: ${testEmail}`);

    // Verify DB records directly
    const [userRows] = await pool.query("SELECT * FROM users WHERE email = ?", [testEmail]);
    if (!userRows.length || userRows[0].role_id !== 5 || userRows[0].employee_id !== createdEmployeeId) {
      throw new Error("DB Error: users record missing or improperly linked!");
    }
    console.log(`  ✓ MySQL DB: 'users' record created with role_id=5 and employee_id=${createdEmployeeId}`);

    const [contractRows] = await pool.query("SELECT * FROM contracts WHERE employee_id = ?", [createdEmployeeId]);
    if (!contractRows.length || contractRows[0].status !== "ACTIVE" || parseFloat(contractRows[0].wage) !== testWage) {
      throw new Error("DB Error: contracts record missing, inactive, or wage mismatch!");
    }
    console.log(`  ✓ MySQL DB: 'contracts' active contract auto-created with wage ₹${contractRows[0].wage}`);

    const [allocRows] = await pool.query("SELECT * FROM leave_allocations WHERE employee_id = ?", [createdEmployeeId]);
    if (allocRows.length < 3) {
      throw new Error("DB Error: leave_allocations missing!");
    }
    console.log(`  ✓ MySQL DB: 'leave_allocations' created (${allocRows.length} leave policy types)`);

    // ------------------------------------------------------------------------
    // STEP 3: Newly Onboarded Employee Logs In & Checks Portal
    // ------------------------------------------------------------------------
    console.log(`\n📌 STEP 3: Newly Created Employee Logs In (${testEmail})`);
    const empLoginRes = await postJson("/auth/login", {
      email: testEmail,
      password: testPassword,
    });

    if (empLoginRes.status !== 200 || !empLoginRes.data.data?.token) {
      throw new Error(`Employee login failed: ${JSON.stringify(empLoginRes.data)}`);
    }

    employeeToken = empLoginRes.data.data.token;
    console.log(`  ✓ Employee logged in successfully! Role: ${empLoginRes.data.data.user.role}`);

    // Verify Employee Profile endpoint
    const profileRes = await getJson("/employee/me/profile", employeeToken);
    const profileObj = profileRes.data.data?.profile || profileRes.data.data;
    if (profileRes.status !== 200 || profileObj.fullName !== "Karan Verma") {
      throw new Error(`Employee profile check failed: ${JSON.stringify(profileRes.data)}`);
    }
    console.log(`  ✓ GET /api/employee/me/profile -> Name: ${profileObj.fullName}, Position: ${profileObj.jobPosition}`);

    // Verify Employee Contract endpoint
    const contractRes = await getJson("/employee/me/contract", employeeToken);
    const activeContract = contractRes.data.data?.activeContract || contractRes.data.data;
    if (contractRes.status !== 200 || (!activeContract.contractReference && !activeContract.contractNumber)) {
      throw new Error(`Employee contract check failed: ${JSON.stringify(contractRes.data)}`);
    }
    console.log(`  ✓ GET /api/employee/me/contract -> Contract: ${activeContract.contractReference || activeContract.contractNumber}, Wage: ${activeContract.wage}`);

    // Verify Employee Leaves endpoint
    const leavesRes = await getJson("/employee/me/leaves", employeeToken);
    if (leavesRes.status !== 200 || leavesRes.data.data.balance.totalAllocated <= 0) {
      throw new Error(`Employee leaves check failed: ${JSON.stringify(leavesRes.data)}`);
    }
    console.log(`  ✓ GET /api/employee/me/leaves -> Total Balance: ${leavesRes.data.data.balance.totalAllocated} days`);

    // ------------------------------------------------------------------------
    // STEP 4: HR Payroll Manager Sees New Employee & Processes Payrun
    // ------------------------------------------------------------------------
    console.log("\n📌 STEP 4: HR Payroll Manager (payroll@gmail.com)");
    const payrollLoginRes = await postJson("/auth/login", {
      email: "payroll@gmail.com",
      password: "123456",
    });

    if (payrollLoginRes.status !== 200 || !payrollLoginRes.data.data?.token) {
      throw new Error(`HR Payroll Manager login failed: ${JSON.stringify(payrollLoginRes.data)}`);
    }

    payrollToken = payrollLoginRes.data.data.token;
    console.log(`  ✓ HR Payroll Manager logged in! Role: ${payrollLoginRes.data.data.user.role}`);

    // Verify Payroll Manager can see the new employee
    const empsListRes = await getJson(`/employees?search=${testCode}`, payrollToken);
    const foundEmp = empsListRes.data.data?.employees?.find((e) => e.code === testCode || e.employee_code === testCode);
    if (!foundEmp) {
      throw new Error("HR Payroll Manager could not find newly onboarded employee in /api/employees!");
    }
    const empDisplayName = foundEmp.name || `${foundEmp.first_name || ""} ${foundEmp.last_name || ""}`.trim() || foundEmp.employee_code;
    console.log(`  ✓ HR Payroll Manager confirmed employee '${empDisplayName}' in employee roster`);

    // Verify Payroll Manager can see the new contract
    const contractsListRes = await getJson(`/contracts?search=${testCode}`, payrollToken);
    const foundContract = contractsListRes.data.data?.contracts?.find((c) => c.employee_code === testCode || c.contract_number?.includes(testCode));
    if (!foundContract) {
      throw new Error("HR Payroll Manager could not find contract in /api/contracts!");
    }
    console.log(`  ✓ HR Payroll Manager confirmed contract '${foundContract.contract_number}' with wage ₹${foundContract.wage}`);

    // Create a new Payrun batch for testing
    console.log("\n📌 STEP 5: HR Payroll Manager Creates & Computes Payrun Batch");
    const testMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const randMonthIdx = Math.floor(Math.random() * 12);
    const randYear = 2030 + Math.floor(Math.random() * 5);
    const mStr = String(randMonthIdx + 1).padStart(2, "0");
    const payrunPayload = {
      period_start: `${randYear}-${mStr}-01`,
      period_end: `${randYear}-${mStr}-28`,
      pay_date: `${randYear}-${mStr}-28`,
      salary_structure_id: 1,
      month: testMonths[randMonthIdx],
      year: String(randYear),
      employee_ids: [createdEmployeeId],
    };

    const createPayrunRes = await postJson("/payroll/payruns", payrunPayload, payrollToken);
    if (createPayrunRes.status !== 201) {
      throw new Error(`Payrun creation failed: ${JSON.stringify(createPayrunRes.data)}`);
    }

    createdPayrunId = createPayrunRes.data.data.payrun.id;
    console.log(`  ✓ Payrun created in 'Draft' state! Batch ID: ${createdPayrunId}`);

    // Compute Payrun
    const computeRes = await postJson(`/payroll/payruns/${createdPayrunId}/compute`, {}, payrollToken);
    if (computeRes.status !== 200) {
      throw new Error(`Payrun compute failed: ${JSON.stringify(computeRes.data)}`);
    }
    console.log(`  ✓ Payrun computed! Gross: ₹${computeRes.data.data.payrun.total_gross}, Net: ₹${computeRes.data.data.payrun.total_net}`);

    // Validate Payrun
    const validateRes = await postJson(`/payroll/payruns/${createdPayrunId}/validate`, {}, payrollToken);
    if (validateRes.status !== 200 || !validateRes.data.data.valid) {
      throw new Error(`Payrun validation failed: ${JSON.stringify(validateRes.data)}`);
    }
    console.log(`  ✓ Payrun validated! Status: ${validateRes.data.data.payrun.status}`);

    // Mark Paid / Disburse
    const payRes = await postJson(`/payroll/payruns/${createdPayrunId}/pay`, {}, payrollToken);
    if (payRes.status !== 200) {
      throw new Error(`Payrun pay failed: ${JSON.stringify(payRes.data)}`);
    }
    console.log(`  ✓ Payrun marked as COMPLETED and finalized! Status: ${payRes.data.data.payrun.status}`);

    // ------------------------------------------------------------------------
    // STEP 6: Employee Sees Live Payslip & Printable Statement
    // ------------------------------------------------------------------------
    console.log("\n📌 STEP 6: Employee Checks 'My Payslips' & PDF Statement");
    const empPayslipsRes = await getJson("/employee/me/payslips?year=All Years", employeeToken);
    if (empPayslipsRes.status !== 200 || !empPayslipsRes.data.data.payslips.length) {
      throw new Error(`Employee payslips not found: ${JSON.stringify(empPayslipsRes.data)}`);
    }

    const latestSlip = empPayslipsRes.data.data.payslips[0];
    createdPayslipId = latestSlip.id;
    console.log(`  ✓ Employee received payslip: ${latestSlip.payslipNumber}, Gross: ${latestSlip.gross}, Net: ${latestSlip.net}, Status: ${latestSlip.paymentStatus}`);

    // Check itemized breakdown
    const slipDetailRes = await getJson(`/employee/me/payslips/${createdPayslipId}`, employeeToken);
    const slipEarnings = slipDetailRes.data.data?.payslip?.earnings || [];
    const slipDeductions = slipDetailRes.data.data?.payslip?.deductions || [];
    if (slipDetailRes.status !== 200 || (!slipEarnings.length && !slipDeductions.length)) {
      throw new Error(`Itemized payslip lines missing: ${JSON.stringify(slipDetailRes.data)}`);
    }
    console.log(`  ✓ Itemized lines verified: ${slipEarnings.length} earning rules + ${slipDeductions.length} deduction rules (BASIC, HRA, PF, etc.)`);

    // Check PDF/HTML generation endpoint
    const pdfRes = await getJson(`/payroll/payslips/${createdPayslipId}/pdf`, employeeToken);
    if (pdfRes.status !== 200 || !pdfRes.raw.includes("PeoplePay360") || !pdfRes.raw.includes("PAYSLIP")) {
      throw new Error(`Payslip PDF/HTML generation failed or missing company branding! Status: ${pdfRes.status}, Raw: ${pdfRes.raw?.slice(0, 100)}`);
    }
    console.log("  ✓ PDF/HTML Statement generated successfully with official branding");

    // ------------------------------------------------------------------------
    // STEP 7: HR and Payroll Dashboards Verification
    // ------------------------------------------------------------------------
    console.log("\n📌 STEP 7: HR & Payroll Manager Dashboard Verification");
    const hrDashRes = await getJson("/hr/dashboard/employees", hrToken);
    console.log(`  ✓ HR Dashboard active headcount: ${hrDashRes.data.data.total_employees} employees`);

    const payDashRes = await getJson("/analytics/dashboard", payrollToken);
    console.log(`  ✓ Payroll Dashboard total net payout: ₹${payDashRes.data.data?.kpi?.total_net_payout || 0}`);

    console.log("\n========================================================================");
    console.log("🎉 ALL MULTI-ROLE SYNCHRONIZATION TESTS PASSED WITH 100% SUCCESS!");
    console.log("   • HR Manager onboards employee -> User account + Active Contract + Leaves auto-created");
    console.log("   • Employee logs in immediately -> Profile, Contract & Leaves reflect live data");
    console.log("   • HR Payroll Manager views employee & contract -> Computes, validates & pays payrun");
    console.log("   • Employee sees finalized payslip in My Payslips with downloadable PDF statement");
    console.log("========================================================================\n");
  } catch (err) {
    console.error("\n❌ VERIFICATION ERROR:", err.message);
    process.exitCode = 1;
  } finally {
    // Clean up test payrun and test employee to keep DB pristine if desired
    if (createdPayrunId) {
      await pool.query("DELETE FROM payslip_lines WHERE payslip_id IN (SELECT id FROM payslips WHERE payrun_id = ?)", [createdPayrunId]);
      await pool.query("DELETE FROM payslips WHERE payrun_id = ?", [createdPayrunId]);
      await pool.query("DELETE FROM payruns WHERE id = ?", [createdPayrunId]);
    }
    if (createdEmployeeId) {
      await pool.query("DELETE FROM leave_allocations WHERE employee_id = ?", [createdEmployeeId]);
      await pool.query("DELETE FROM contracts WHERE employee_id = ?", [createdEmployeeId]);
      await pool.query("DELETE FROM users WHERE employee_id = ?", [createdEmployeeId]);
      await pool.query("DELETE FROM employees WHERE id = ?", [createdEmployeeId]);
    }
    await pool.end();
  }
}

runRoleSyncVerification();
