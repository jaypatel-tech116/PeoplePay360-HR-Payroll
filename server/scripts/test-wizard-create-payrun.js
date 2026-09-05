async function testCreatePayrunWizard() {
  try {
    const baseURL = "http://localhost:5000/api";

    console.log("1. Authenticating as HR Payroll Manager...");
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "payroll@gmail.com", password: "payroll" }),
    });
    const token = (await loginRes.json()).data.token;
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("2. Fetching available salary structures...");
    const structRes = await fetch(`${baseURL}/salary-rules/structures`, { headers: authHeaders });
    const structures = (await structRes.json()).data.structures;
    console.log(`Loaded ${structures.length} salary structures:`);
    structures.forEach((s) => console.log(`  Structure ${s.id}: ${s.name} (active: ${s.is_active})`));

    // Test creating payrun for November 2026 for Structure 1, with employee IDs 18 (Karan Verma) and 26 (tester4)
    console.log("\n3. Creating payrun for November 2026 (Structure 1)...");
    const createRes = await fetch(`${baseURL}/payroll/payruns`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        salary_structure_id: 1,
        month: "November",
        year: "2026",
        period_start: "2026-11-01",
        period_end: "2026-11-30",
      }),
    });
    const createData = await createRes.json();
    if (!createData.success) {
      throw new Error("Create payrun failed: " + createData.message);
    }
    const payrunId = createData.data.payrun.id;
    console.log("✅ Payrun created successfully! ID:", payrunId, "Run Number:", createData.data.payrun.run_number);

    console.log(`\n4. Computing payrun ${payrunId} for Karan Verma and tester4 (IDs: [18, 26])...`);
    const compRes = await fetch(`${baseURL}/payroll/payruns/${payrunId}/compute`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ employee_ids: [18, 26] }),
    });
    const compData = await compRes.json();
    if (!compData.success) {
      throw new Error("Compute payrun failed: " + compData.message);
    }

    console.log("✅ Payrun computed successfully!");
    const prDetails = (await (await fetch(`${baseURL}/payroll/payruns/${payrunId}`, { headers: authHeaders })).json()).data.payrun;
    console.log("Total Gross: ₹", prDetails.total_gross);
    console.log("Total Net: ₹", prDetails.total_net);
    console.log("Payslips generated:", prDetails.payslips.length);
    prDetails.payslips.forEach((p) => {
      console.log(`  • ${p.employee_name} (${p.employee_code}): Gross ₹${p.gross_amount} | Deductions ₹${p.deduction_amount} | Net ₹${p.net_amount}`);
    });

    console.log("\n5. Cleaning up test payrun...");
    const delRes = await fetch(`${baseURL}/payroll/payruns/${payrunId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    console.log("Cleanup:", (await delRes.json()).message);

    console.log("\n🎉 ALL WIZARD CREATION AND COMPUTATION TESTS PASSED 100%!");
    process.exit(0);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

testCreatePayrunWizard();
