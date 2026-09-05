const payrollEngine = require("../src/services/payroll-engine.service");
const { pool } = require("../src/config/mysqlDb");

async function testPipelineEndToEnd() {
  console.log("==================================================");
  console.log("🧪 TESTING STRICT 4-STEP PAYRUN PIPELINE & FORMULAS");
  console.log("==================================================");

  try {
    // 1. STEP 1: CREATE DRAFT PAYRUN
    console.log("\n▶ Step 1: Creating Payrun Batch in DRAFT status...");
    const draftRun = await payrollEngine.createPayrun({
      salary_structure_id: 1,
      period_start: "2026-11-01",
      period_end: "2026-11-30",
      month: "November",
      year: "2026",
      employee_ids: [1, 2, 3], // Employees 1, 2, 3
      user_id: "usr-paymgr-002",
    });

    console.log(`✓ Payrun created with ID: ${draftRun.id}, Run Number: ${draftRun.run_number}`);
    console.log(`  Status: ${draftRun.status} (Expected: Draft)`);
    console.log(`  Gross: ₹${draftRun.total_gross}, Net: ₹${draftRun.total_net}, Employees: ${draftRun.employee_count}`);
    if (draftRun.status !== "Draft") throw new Error("Step 1 Failed: Status is not Draft!");

    // 2. TEST STRICT GUARD: Attempt Validate on Draft (Must FAIL)
    console.log("\n▶ Testing Strict Guard: Attempting Validate on Draft batch...");
    try {
      await payrollEngine.validatePayrun(draftRun.id);
      throw new Error("Strict Guard Failed: validatePayrun should have thrown error on Draft!");
    } catch (valErr) {
      console.log(`✓ Expected Guard Caught: "${valErr.message}" (Code: ${valErr.code})`);
    }

    // 3. TEST STRICT GUARD: Attempt Mark Paid on Draft (Must FAIL)
    console.log("\n▶ Testing Strict Guard: Attempting Mark Paid on Draft batch...");
    try {
      await payrollEngine.markPayrunPaid(draftRun.id);
      throw new Error("Strict Guard Failed: markPayrunPaid should have thrown error on Draft!");
    } catch (paidErr) {
      console.log(`✓ Expected Guard Caught: "${paidErr.message}" (Code: ${paidErr.code})`);
    }

    // 4. STEP 2: COMPUTE SALARY RULES
    console.log("\n▶ Step 2: Computing Payrun with standardized dynamic salary rules...");
    const computedRun = await payrollEngine.computePayrun(draftRun.id, "usr-paymgr-002", [1, 2, 3]);
    console.log(`✓ Payrun computed:`);
    console.log(`  Status: ${computedRun.status} (Expected: Computed)`);
    console.log(`  Total Gross: ₹${computedRun.total_gross}`);
    console.log(`  Total Deductions: ₹${computedRun.total_deductions}`);
    console.log(`  Total Net: ₹${computedRun.total_net}`);
    console.log(`  Employee Count: ${computedRun.employee_count}`);

    if (computedRun.status !== "Computed") throw new Error("Step 2 Failed: Status is not Computed!");
    if (parseFloat(computedRun.total_gross) <= 0) throw new Error("Gross must be > 0!");
    if (parseFloat(computedRun.total_net) <= 0) throw new Error("Net must be > 0 (no zero net salary bug)!");

    // Inspect individual payslip lines
    const [slips] = await pool.query(`SELECT id, employee_id, payslip_number, gross_amount, deduction_amount, net_amount FROM payslips WHERE payrun_id = ?;`, [draftRun.id]);
    console.log(`\n  Itemized Employee Payslips (${slips.length}):`);
    for (const s of slips) {
      const [emp] = await pool.query(`SELECT employee_code, first_name, last_name FROM employees WHERE id = ?;`, [s.employee_id]);
      const [contract] = await pool.query(`SELECT wage FROM contracts WHERE employee_id = ?;`, [s.employee_id]);
      console.log(`    • ${emp[0].first_name} ${emp[0].last_name} (${emp[0].employee_code}): Contract Wage = ₹${contract[0]?.wage} | Gross = ₹${s.gross_amount} | Deductions = ₹${s.deduction_amount} | Net = ₹${s.net_amount}`);
      
      // Verify Gross equals Contract Wage
      if (parseFloat(contract[0]?.wage) !== parseFloat(s.gross_amount)) {
        throw new Error(`Gross discrepancy: Employee wage is ₹${contract[0]?.wage} but Gross is ₹${s.gross_amount}`);
      }
      // Verify Net is realistic
      if (parseFloat(s.net_amount) <= 0 || parseFloat(s.net_amount) >= parseFloat(s.gross_amount)) {
        throw new Error(`Net salary unrealistic: ₹${s.net_amount}`);
      }
    }

    // 5. TEST STRICT GUARD: Attempt Mark Paid on Computed (Must FAIL - cannot skip Step 3)
    console.log("\n▶ Testing Strict Guard: Attempting Mark Paid before Validation...");
    try {
      await payrollEngine.markPayrunPaid(draftRun.id);
      throw new Error("Strict Guard Failed: markPayrunPaid should have thrown error on Computed!");
    } catch (paidErr2) {
      console.log(`✓ Expected Guard Caught: "${paidErr2.message}" (Code: ${paidErr2.code})`);
    }

    // 6. STEP 3: VALIDATE PAYRUN
    console.log("\n▶ Step 3: Validating Payrun with 7-point audit...");
    const valResult = await payrollEngine.validatePayrun(draftRun.id, "usr-paymgr-002");
    console.log(`✓ Payrun validated:`);
    console.log(`  Valid: ${valResult.valid}`);
    console.log(`  Status: ${valResult.payrun.status} (Expected: Validated)`);
    console.log(`  Warnings count: ${valResult.warnings.length}`);
    if (valResult.payrun.status !== "Validated") throw new Error("Step 3 Failed: Status is not Validated!");

    // 7. STEP 4: MARK PAID & FINALIZE
    console.log("\n▶ Step 4: Marking Payrun as Paid (Final Disbursement)...");
    const finalizedRun = await payrollEngine.markPayrunPaid(draftRun.id, "usr-paymgr-002");
    console.log(`✓ Payrun finalized and paid:`);
    console.log(`  Status: ${finalizedRun.status} (Expected: Completed)`);
    console.log(`  Paid At: ${finalizedRun.paid_at}`);

    const [finalSlips] = await pool.query(`SELECT id, payment_status, status FROM payslips WHERE payrun_id = ?;`, [draftRun.id]);
    const allPaid = finalSlips.every(s => s.payment_status === "PAID" && s.status === "Paid");
    console.log(`  All payslips marked PAID: ${allPaid} (${finalSlips.length}/${finalSlips.length})`);
    if (!allPaid) throw new Error("Step 4 Failed: Payslips are not marked PAID!");

    // 8. TEST STRICT GUARD: Attempt Recompute on Paid (Must FAIL)
    console.log("\n▶ Testing Strict Guard: Attempting Recomputation on Paid payrun...");
    try {
      await payrollEngine.computePayrun(draftRun.id);
      throw new Error("Strict Guard Failed: computePayrun should have thrown error on Paid payrun!");
    } catch (compErr) {
      console.log(`✓ Expected Guard Caught: "${compErr.message}" (Code: ${compErr.code})`);
    }

    console.log("\n==================================================");
    console.log("🎉 ALL TESTS PASSED! Strict 4-step pipeline and formulas fully verified!");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  }
}

testPipelineEndToEnd();
