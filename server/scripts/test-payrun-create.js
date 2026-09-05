const BASE_URL = "http://localhost:5000/api";

async function postJson(url, data, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || "HTTP Error");
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

async function test() {
  try {
    console.log("1. Authenticating as Admin...");
    const login = await postJson(`${BASE_URL}/auth/login`, {
      email: "admin.aarav.reddy101@peoplepay360.com",
      password: "123456",
    });
    const token = login.data.token;
    console.log("✅ Authenticated.");

    console.log("2. Creating Payrun for November 2026 (Where PAY-2026-11 already exists)...");
    const res = await postJson(`${BASE_URL}/payroll/payruns`, {
      salary_structure_id: 1,
      period_start: "2026-11-01",
      period_end: "2026-11-30",
      month: "November",
      year: "2026",
      employee_ids: [3, 4, 5, 6, 7], // EMP003 to EMP007
    }, token);

    const createdPayrun = res.data.payrun;
    console.log("✅ Successfully created payrun:", {
      id: createdPayrun.id,
      run_number: createdPayrun.run_number,
      month: createdPayrun.month,
      year: createdPayrun.year,
      status: createdPayrun.status,
    });

    console.log("3. Computing payrun...");
    const compRes = await postJson(`${BASE_URL}/payroll/payruns/${createdPayrun.id}/compute`, {
      employee_ids: [3, 4, 5, 6, 7],
    }, token);

    console.log("✅ Successfully computed payrun:", {
      id: compRes.data.payrun.id,
      run_number: compRes.data.payrun.run_number,
      employee_count: compRes.data.payrun.employee_count,
      total_net: compRes.data.payrun.total_net,
      status: compRes.data.payrun.status,
    });

    // Clean up test payrun
    console.log("4. Cleaning up test batch...");
    const delRes = await fetch(`${BASE_URL}/payroll/payruns/${createdPayrun.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Cleaned up successfully (status:", delRes.status, ")");

  } catch (err) {
    console.error("❌ Error:", err.data || err.message);
  } finally {
    process.exit(0);
  }
}

test();
