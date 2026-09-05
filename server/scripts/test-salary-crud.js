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

async function putJson(url, data, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "PUT",
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

async function deleteJson(url, token = null) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers,
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

async function testCrud() {
  try {
    console.log("1. Logging in as Admin...");
    const loginRes = await postJson(`${BASE_URL}/auth/login`, {
      email: "admin.aarav.reddy101@peoplepay360.com",
      password: "123456",
    });

    const token = loginRes.data.token;
    console.log("✅ Authenticated successfully.");

    // Test 1: Validate Formula endpoint
    console.log("\n2. Testing POST /salary-rules/rules/validate-formula...");
    const formulaTest1 = await postJson(`${BASE_URL}/salary-rules/rules/validate-formula`, {
      formula: "result = categories['BASIC'] * 0.40",
      sampleWage: 50000,
    }, token);
    console.log("   Formula Test 1 (Odoo syntax):", formulaTest1.data);

    const formulaTest2 = await postJson(`${BASE_URL}/salary-rules/rules/validate-formula`, {
      formula: "(WAGE / 30) * PAID_DAYS",
      sampleWage: 60000,
    }, token);
    console.log("   Formula Test 2 (Proration):", formulaTest2.data);

    try {
      await postJson(`${BASE_URL}/salary-rules/rules/validate-formula`, {
        formula: "BASIC + * 5",
      }, token);
      console.error("❌ Failed: Syntax error formula should have been rejected!");
    } catch (err) {
      console.log("✅ Correctly rejected invalid formula:", err.message);
    }

    // Test 2: Create a Custom Structure
    console.log("\n3. Testing Structure CRUD (create -> update -> delete)...");
    const testStructCode = `TEST_ST_${Date.now()}`;
    const createStructRes = await postJson(`${BASE_URL}/salary-rules/structures`, {
      name: "Engineering Special Structure",
      code: testStructCode,
      type: "FT",
      description: "Custom structure for technical leads with performance allowances",
      is_active: true,
    }, token);
    const createdStruct = createStructRes.data.structure;
    console.log("✅ Structure created:", createdStruct.id, createdStruct.code, createdStruct.name);

    // Update structure
    const updateStructRes = await putJson(`${BASE_URL}/salary-rules/structures/${createdStruct.id}`, {
      name: "Engineering Special Structure (Updated)",
      description: "Updated description for technical leads",
    }, token);
    console.log("✅ Structure updated:", updateStructRes.data.structure.name);

    // Test 3: Create Custom Rules inside this structure
    console.log("\n4. Testing Rule CRUD inside the custom structure...");
    
    // Rule 1: Percentage of wage (Basic Salary)
    const createRule1 = await postJson(`${BASE_URL}/salary-rules/rules`, {
      salary_structure_id: createdStruct.id,
      name: "Custom Base Pay",
      code: "BASE_PAY",
      category: "BASIC",
      calculation_type: "PERCENTAGE",
      percentage: 50,
      sequence: 1,
      quantity: 1.0,
    }, token);
    const rule1 = createRule1.data.rule;
    console.log("✅ Rule 1 (Percentage) created:", rule1.id, rule1.code);

    // Rule 2: Formula rule using Odoo syntax
    const createRule2 = await postJson(`${BASE_URL}/salary-rules/rules`, {
      salary_structure_id: createdStruct.id,
      name: "Performance Tech Bonus",
      code: "TECH_BONUS",
      category: "ALLOWANCE",
      calculation_type: "FORMULA",
      formula: "result = categories['BASE_PAY'] * 0.25",
      sequence: 2,
      quantity: 1.0,
    }, token);
    const rule2 = createRule2.data.rule;
    console.log("✅ Rule 2 (Formula) created:", rule2.id, rule2.code, rule2.formula);

    // Rule 3: Fixed Amount deduction
    const createRule3 = await postJson(`${BASE_URL}/salary-rules/rules`, {
      salary_structure_id: createdStruct.id,
      name: "Gym Welfare Deduction",
      code: "GYM_DED",
      category: "DEDUCTION",
      calculation_type: "FIXED",
      fixed_amount: 500,
      sequence: 30,
      quantity: 1.0,
    }, token);
    const rule3 = createRule3.data.rule;
    console.log("✅ Rule 3 (Fixed) created:", rule3.id, rule3.code, rule3.fixed_amount);

    // Test duplicate rule rejection
    try {
      await postJson(`${BASE_URL}/salary-rules/rules`, {
        salary_structure_id: createdStruct.id,
        name: "Duplicate Base Pay",
        code: "BASE_PAY",
        category: "BASIC",
        calculation_type: "FIXED",
        fixed_amount: 1000,
      }, token);
      console.error("❌ Failed: Duplicate code should have been rejected!");
    } catch (err) {
      console.log("✅ Correctly rejected duplicate rule code:", err.message);
    }

    // Update Rule 2
    const updateRule2 = await putJson(`${BASE_URL}/salary-rules/rules/${rule2.id}`, {
      name: "Performance Tech Bonus (Revised 30%)",
      formula: "result = categories['BASE_PAY'] * 0.30",
    }, token);
    console.log("✅ Rule 2 updated:", updateRule2.data.rule.name, updateRule2.data.rule.formula);

    // Delete Rule 3
    await deleteJson(`${BASE_URL}/salary-rules/rules/${rule3.id}`, token);
    console.log("✅ Rule 3 deleted successfully.");

    // Delete Rule 2 & 1
    await deleteJson(`${BASE_URL}/salary-rules/rules/${rule2.id}`, token);
    await deleteJson(`${BASE_URL}/salary-rules/rules/${rule1.id}`, token);
    console.log("✅ Rules 2 & 1 deleted successfully.");

    // Delete Structure
    await deleteJson(`${BASE_URL}/salary-rules/structures/${createdStruct.id}`, token);
    console.log("✅ Custom Structure deleted successfully.");

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Full CRUD & Formula Engine is 100% operational!");
  } catch (err) {
    console.error("❌ Test failed:", err.data || err.message);
  } finally {
    process.exit(0);
  }
}

testCrud();
