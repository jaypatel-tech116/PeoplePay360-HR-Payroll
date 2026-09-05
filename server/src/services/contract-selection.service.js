const { pool } = require("../config/mysqlDb");

/**
 * Validates and retrieves the exact applicable contract for an employee during a payroll period
 * 
 * Rules:
 * - Must belong to employee_id
 * - Status must be 'ACTIVE'
 * - Date overlap: start_date <= periodEnd AND (end_date IS NULL OR end_date >= periodStart)
 * - Exactly one valid contract must exist. If 0 or >1, throws a structured validation error.
 * 
 * @param {number|string} employeeId
 * @param {string|Date} periodStart - YYYY-MM-DD or Date
 * @param {string|Date} periodEnd - YYYY-MM-DD or Date
 * @returns {Promise<Object>} The single valid applicable contract
 */
const getApplicableContract = async (employeeId, periodStart, periodEnd) => {
  const pStart = typeof periodStart === "string" ? periodStart.split("T")[0] : new Date(periodStart).toISOString().split("T")[0];
  const pEnd = typeof periodEnd === "string" ? periodEnd.split("T")[0] : new Date(periodEnd).toISOString().split("T")[0];

  const [contracts] = await pool.query(`
    SELECT 
      c.*,
      e.employee_code,
      e.first_name,
      e.last_name,
      e.email,
      e.joining_date,
      e.termination_date,
      ss.name AS salary_structure_name,
      ss.code AS salary_structure_code
    FROM contracts c
    JOIN employees e ON c.employee_id = e.id
    LEFT JOIN salary_structures ss ON c.salary_structure_id = ss.id
    WHERE c.employee_id = ?
      AND c.status = 'ACTIVE'
      AND c.start_date <= ?
      AND (c.end_date IS NULL OR c.end_date >= ?)
    ORDER BY c.start_date DESC;
  `, [employeeId, pEnd, pStart]);

  if (contracts.length === 0) {
    const err = new Error(`No applicable active contract found for employee ID ${employeeId} during period ${pStart} to ${pEnd}.`);
    err.code = "NO_CONTRACT";
    err.employeeId = employeeId;
    throw err;
  }

  if (contracts.length > 1) {
    const err = new Error(`Multiple overlapping active contracts found for employee ID ${employeeId} during period ${pStart} to ${pEnd}. Overlapping contract numbers: ${contracts.map(c => c.contract_number).join(', ')}.`);
    err.code = "MULTIPLE_CONTRACTS";
    err.employeeId = employeeId;
    err.contracts = contracts;
    throw err;
  }

  return contracts[0];
};

/**
 * Validates that adding or updating a contract will not cause concurrent active overlapping contracts
 * @param {number|string} employeeId
 * @param {string} startDate
 * @param {string|null} endDate
 * @param {number|string|null} currentContractId - ID to exclude if updating
 */
const validateNoOverlappingContract = async (employeeId, startDate, endDate, currentContractId = null) => {
  const sDate = startDate.split("T")[0];
  const eDate = endDate ? endDate.split("T")[0] : null;

  let sql = `
    SELECT id, contract_number, start_date, end_date
    FROM contracts
    WHERE employee_id = ?
      AND status = 'ACTIVE'
  `;
  const params = [employeeId];

  if (currentContractId) {
    sql += ` AND id != ?`;
    params.push(currentContractId);
  }

  const [existing] = await pool.query(sql, params);

  for (const c of existing) {
    const cStart = new Date(c.start_date).toISOString().split("T")[0];
    const cEnd = c.end_date ? new Date(c.end_date).toISOString().split("T")[0] : null;

    // Check overlap:
    // (StartA <= EndB) and (EndA >= StartB)
    const overlap = (!eDate || cStart <= eDate) && (!cEnd || cEnd >= sDate);
    if (overlap) {
      const err = new Error(`Contract overlaps with active contract ${c.contract_number} (${cStart} to ${cEnd || 'indefinite'}).`);
      err.code = "OVERLAPPING_CONTRACT";
      throw err;
    }
  }

  return true;
};

module.exports = {
  getApplicableContract,
  validateNoOverlappingContract,
};
