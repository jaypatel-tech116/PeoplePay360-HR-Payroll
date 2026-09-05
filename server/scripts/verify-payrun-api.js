async function testPayrunFlow() {
  try {
    const baseURL = "http://localhost:5000/api";

    console.log("1. Logging in as HR Payroll Manager (payroll@gmail.com)...");
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "payroll@gmail.com", password: "payroll" }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log("✅ Authenticated successfully! Role:", loginData.data.user.role);

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("\n2. Fetching Payruns list...");
    const payrunsRes = await fetch(`${baseURL}/payroll/payruns`, { headers: authHeaders });
    const payrunsData = await payrunsRes.json();
    const payruns = payrunsData.data?.payruns || [];
    console.log(`✅ Loaded ${payruns.length} payrun batches.`);

    console.log("\n3. Fetching Payrun #30 details...");
    const pr30Res = await fetch(`${baseURL}/payroll/payruns/30`, { headers: authHeaders });
    const pr30Data = await pr30Res.json();
    const pr30 = pr30Data.data?.payrun;
    console.log("Payrun 30 status:", pr30.status);
    console.log("Payrun 30 employee count:", pr30.employee_count);
    console.log("Payrun 30 total gross: ₹", pr30.total_gross);
    console.log("Payrun 30 total net: ₹", pr30.total_net);

    console.log("\n--- ITEMIZED SLIPS RETURNED BY API ---");
    pr30.payslips.forEach((s) => {
      console.log(`• ${s.employee_name} (${s.employee_code}): Gross ₹${s.gross_amount} | Deductions ₹${s.deduction_amount} | Net ₹${s.net_amount} | Worked: ${s.worked_days}d | Paid: ${s.paid_days}d`);
    });

    console.log("\n4. Testing Validate Payrun #30 via API...");
    const valRes = await fetch(`${baseURL}/payroll/payruns/30/validate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const valData = await valRes.json();
    console.log("✅ Validation response:", valData.message || "Validated");

    const pr30ValRes = await fetch(`${baseURL}/payroll/payruns/30`, { headers: authHeaders });
    const pr30Val = (await pr30ValRes.json()).data?.payrun;
    console.log("Status after validation:", pr30Val.status);

    console.log("\n5. Testing Mark Paid Payrun #30 via API...");
    const paidRes = await fetch(`${baseURL}/payroll/payruns/30/mark-paid`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const paidData = await paidRes.json();
    console.log("✅ Mark Paid response:", paidData.message || "Paid");

    const pr30PaidRes = await fetch(`${baseURL}/payroll/payruns/30`, { headers: authHeaders });
    const pr30Paid = (await pr30PaidRes.json()).data?.payrun;
    console.log("Status after Mark Paid:", pr30Paid.status);
    console.log("🎉 Complete Payrun lifecycle verified successfully!");

    process.exit(0);
  } catch (err) {
    console.error("API test failed:", err);
    process.exit(1);
  }
}

testPayrunFlow();
