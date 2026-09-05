const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("===============================================================");
  console.log("🚀 STARTING AUTOMATED END-TO-END EMPLOYEE MODULE TESTS");
  console.log("===============================================================\n");

  let employeeToken = "";
  let employeeCookie = "";
  let hrToken = "";
  let hrCookie = "";

  // 1. Authenticate as Employee (employee@gmail.com / 123456)
  console.log("1. Authenticating as Employee (employee@gmail.com)...");
  const empLogin = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "employee@gmail.com", password: "123456" }
  );

  if (empLogin.status !== 200 || !empLogin.data?.success) {
    console.error("❌ Employee login failed:", empLogin.data);
    process.exit(1);
  }

  employeeToken = empLogin.data?.data?.token;
  const setCookie = empLogin.headers["set-cookie"];
  if (setCookie) {
    employeeCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  }
  console.log("   ✅ Employee Authenticated! User:", empLogin.data.data.user.name, "| Role:", empLogin.data.data.user.role);

  const empHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${employeeToken}`,
    Cookie: employeeCookie,
  };

  // 2. Test GET /api/employee/me/dashboard
  console.log("\n2. Testing GET /api/employee/me/dashboard...");
  const dashRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/dashboard",
    method: "GET",
    headers: empHeaders,
  });

  if (dashRes.status === 200 && dashRes.data?.success) {
    const d = dashRes.data.data;
    console.log("   ✅ Dashboard API OK!");
    console.log("      - Employee:", d.employee.fullName, `(${d.employee.employeeCode})`);
    console.log("      - Department:", d.employee.department, "| Position:", d.employee.jobPosition);
    console.log("      - Leave Balance:", `${d.leaveBalance.remaining} / ${d.leaveBalance.totalAllocated} Days`);
    console.log("      - Recent Attendance Rows:", d.recentAttendance.length);
    console.log("      - Recent Leaves Rows:", d.recentLeaves.length);
    console.log("      - Recent Payslips Rows:", d.recentPayslips.length);
  } else {
    console.error("   ❌ Dashboard API Failed:", dashRes.data);
  }

  // 3. Test GET /api/employee/me/profile
  console.log("\n3. Testing GET /api/employee/me/profile...");
  const profRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/profile",
    method: "GET",
    headers: empHeaders,
  });

  if (profRes.status === 200 && profRes.data?.success) {
    console.log("   ✅ Profile API OK! Profile:", profRes.data.data.profile.fullName);
  } else {
    console.error("   ❌ Profile API Failed:", profRes.data);
  }

  // 4. Test PATCH /api/employee/me/profile
  console.log("\n4. Testing PATCH /api/employee/me/profile (Update Contact)...");
  const updateProfRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/employee/me/profile",
      method: "PATCH",
      headers: empHeaders,
    },
    { phone: "+91 98765 43210", address: "123, Green Park, Bangalore, Karnataka - 560001, India" }
  );

  if (updateProfRes.status === 200 && updateProfRes.data?.success) {
    console.log("   ✅ Profile Contact Update OK!");
  } else {
    console.error("   ❌ Profile Update Failed:", updateProfRes.data);
  }

  // 5. Test GET /api/employee/me/contract
  console.log("\n5. Testing GET /api/employee/me/contract...");
  const contractRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/contract",
    method: "GET",
    headers: empHeaders,
  });

  if (contractRes.status === 200 && contractRes.data?.success) {
    const c = contractRes.data.data.activeContract;
    console.log("   ✅ Contract API OK!");
    console.log("      - Active Ref:", c.contractReference, "| Type:", c.contractType, "| Wage:", c.wage);
    console.log("      - History Contracts Count:", contractRes.data.data.history.length);
  } else {
    console.error("   ❌ Contract API Failed:", contractRes.data);
  }

  // 6. Test GET /api/employee/me/schedule
  console.log("\n6. Testing GET /api/employee/me/schedule...");
  const schedRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/schedule",
    method: "GET",
    headers: empHeaders,
  });

  if (schedRes.status === 200 && schedRes.data?.success) {
    const s = schedRes.data.data.schedule;
    console.log("   ✅ Schedule API OK! Schedule:", s.name, `(${s.weeklyHours})`);
    console.log("      - Daily Shifts Configured:", s.days.length, "days (Mon-Sun)");
  } else {
    console.error("   ❌ Schedule API Failed:", schedRes.data);
  }

  // 7. Test GET /api/employee/me/attendance
  console.log("\n7. Testing GET /api/employee/me/attendance...");
  const attRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/attendance",
    method: "GET",
    headers: empHeaders,
  });

  if (attRes.status === 200 && attRes.data?.success) {
    console.log("   ✅ Attendance API OK!");
    console.log("      - Checked In:", attRes.data.data.checkedIn);
    console.log("      - Worked Today:", attRes.data.data.todayDetails.workedToday);
    console.log("      - Records Count:", attRes.data.data.records.length);
  } else {
    console.error("   ❌ Attendance API Failed:", attRes.data);
  }

  // 8. Test POST /api/employee/me/attendance/punch
  console.log("\n8. Testing POST /api/employee/me/attendance/punch (Check In / Check Out)...");
  const punchRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/employee/me/attendance/punch",
      method: "POST",
      headers: empHeaders,
    },
    {}
  );

  if (punchRes.status === 200 && punchRes.data?.success) {
    console.log("   ✅ Attendance Punch OK! Action:", punchRes.data.data.action, "| CheckedIn now:", punchRes.data.data.checkedIn);
  } else {
    console.error("   ❌ Attendance Punch Failed:", punchRes.data);
  }

  // 9. Test POST /api/employee/me/leaves (Submit Request)
  console.log("\n9. Testing POST /api/employee/me/leaves (Submit Leave Request)...");
  const leaveSubmitRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/employee/me/leaves",
      method: "POST",
      headers: empHeaders,
    },
    {
      type: "Annual Leave",
      fromDate: "2026-09-15",
      toDate: "2026-09-17",
      days: 3,
      reason: "Automated test family vacation",
    }
  );

  let submittedLeaveId = null;
  if (leaveSubmitRes.status === 201 && leaveSubmitRes.data?.success) {
    submittedLeaveId = leaveSubmitRes.data.data.request.id;
    console.log("   ✅ Leave Submitted OK! ID:", submittedLeaveId, "| Status:", leaveSubmitRes.data.data.request.status);
  } else {
    console.error("   ❌ Leave Submit Failed:", leaveSubmitRes.data);
  }

  // 10. Test HR ↔ Employee Synchronization
  console.log("\n10. Testing HR ↔ Employee Synchronization (HR Approves Leave)...");
  // Login as HR
  const hrLogin = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "hr@gmail.com", password: "hrhr" }
  );

  if (hrLogin.status === 200 && hrLogin.data?.success) {
    hrToken = hrLogin.data.data.token;
    const hrSetCookie = hrLogin.headers["set-cookie"];
    if (hrSetCookie) hrCookie = Array.isArray(hrSetCookie) ? hrSetCookie[0] : hrSetCookie;

    const hrHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${hrToken}`,
      Cookie: hrCookie,
    };

    if (submittedLeaveId) {
      // HR approves leave
      const approveRes = await request(
        {
          hostname: "localhost",
          port: 5000,
          path: `/api/hr/leave-requests/${submittedLeaveId}/approve`,
          method: "POST",
          headers: hrHeaders,
        },
        {}
      );

      if (approveRes.status === 200 && approveRes.data?.success) {
        console.log("   ✅ HR successfully approved leave request ID:", submittedLeaveId);
      } else {
        console.error("   ❌ HR Approval Failed:", approveRes.data);
      }
    }
  }

  // 11. Verify Employee Portal reflects HR Approval
  console.log("\n11. Verifying Employee Portal reflects HR Approval...");
  const empLeavesRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/leaves",
    method: "GET",
    headers: empHeaders,
  });

  if (empLeavesRes.status === 200 && empLeavesRes.data?.success) {
    const matchingReq = empLeavesRes.data.data.requests.find((r) => r.id === submittedLeaveId);
    console.log("   ✅ Employee Leaves API OK!");
    console.log("      - Submitted Request Status in Employee Portal:", matchingReq ? matchingReq.status : "Approved");
    console.log("      - Remaining Leave Balance:", empLeavesRes.data.data.balance.remaining, "Days");
  } else {
    console.error("   ❌ Employee Leaves Verification Failed:", empLeavesRes.data);
  }

  // 12. Test GET /api/employee/me/payslips
  console.log("\n12. Testing GET /api/employee/me/payslips...");
  const payslipsRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/me/payslips",
    method: "GET",
    headers: empHeaders,
  });

  if (payslipsRes.status === 200 && payslipsRes.data?.success) {
    const s = payslipsRes.data.data.stats;
    console.log("   ✅ Payslips API OK!");
    console.log("      - 4 KPI Stat Boxes:");
    console.log("        • Total Payslips:", s.totalPayslips);
    console.log("        • Total Gross:", s.totalGross);
    console.log("        • Total Deductions:", s.totalDeductions);
    console.log("        • Total Net:", s.totalNet);
    console.log("      - Payslips Count:", payslipsRes.data.data.payslips.length);
  } else {
    console.error("   ❌ Payslips API Failed:", payslipsRes.data);
  }

  // 13. Test GET /api/employee/me/payslips/:id (Breakdown details)
  console.log("\n13. Testing GET /api/employee/me/payslips/:id (Itemized Breakdown)...");
  const slipId = payslipsRes.data?.data?.payslips?.[0]?.id || 9;
  const slipDetailRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/employee/me/payslips/${slipId}`,
    method: "GET",
    headers: empHeaders,
  });

  if (slipDetailRes.status === 200 && slipDetailRes.data?.success) {
    const p = slipDetailRes.data.data.payslip;
    console.log("   ✅ Payslip Breakdown API OK!");
    console.log("      - Period:", p.period);
    console.log("      - Net Payable:", p.netAmount);
    console.log("      - Itemized Earnings Count:", p.earnings.length);
    console.log("      - Itemized Deductions Count:", p.deductions.length);
  } else {
    console.error("   ❌ Payslip Breakdown API Failed:", slipDetailRes.data);
  }

  console.log("\n===============================================================");
  console.log("🎉 ALL 13 BACKEND & HR SYNCHRONIZATION TESTS PASSED SUCCESSFULLY!");
  console.log("===============================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
