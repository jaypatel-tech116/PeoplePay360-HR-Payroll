const { query } = require('../config/db');

/**
 * Resolves the unique applicable contract for an employee during a given payrun period.
 * 
 * Rules:
 * - Contract must have status = 'active'
 * - start_date <= period_end
 * - (end_date IS NULL OR end_date >= period_start)
 * - If 0 contracts found: raise missing_contract warning
 * - If > 1 contract found: raise data-integrity conflict warning
 * - If contract end_date falls within the period: raise contract_expiring notice
 */
async function resolveContractForPeriod(employeeId, periodStart, periodEnd) {
  const result = await query(
    `SELECT c.*, s.name AS structure_name, ws.name AS schedule_name,
            e.full_name AS employee_name, e.bank_account_number, e.ifsc_code, e.bank_verified
     FROM contracts c
     JOIN salary_structures s ON c.salary_structure_id = s.id
     JOIN working_schedules ws ON c.working_schedule_id = ws.id
     JOIN employees e ON c.employee_id = e.id
     WHERE c.employee_id = $1
       AND c.status = 'active'
       AND c.start_date <= $3
       AND (c.end_date IS NULL OR c.end_date >= $2)`,
    [employeeId, periodStart, periodEnd]
  );

  const warnings = [];

  if (result.rows.length === 0) {
    return {
      contract: null,
      warnings: [{
        type: 'missing_contract',
        message: `No active contract covering payrun period (${periodStart} to ${periodEnd}).`
      }]
    };
  }

  if (result.rows.length > 1) {
    return {
      contract: null,
      warnings: [{
        type: 'missing_contract',
        message: `Multiple active contracts (${result.rows.length}) found overlapping with period (${periodStart} to ${periodEnd}). Ambiguous contract resolution.`
      }]
    };
  }

  const contract = result.rows[0];

  // Check if contract is expiring within period
  if (contract.end_date && new Date(contract.end_date) <= new Date(periodEnd)) {
    warnings.push({
      type: 'contract_expiring',
      message: `Contract ends on ${contract.end_date}, which falls inside or immediately after this payrun period.`
    });
  }

  return {
    contract,
    warnings
  };
}

module.exports = { resolveContractForPeriod };
