const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Controller to provide complete database analysis and metadata for MySQL 8.0
 */
const getDatabaseAnalysis = async (req, res) => {
  try {
    const expectedTables = [
      "roles",
      "users",
      "departments",
      "employees",
      "working_schedules",
      "contracts",
      "attendance",
      "leave_types",
      "leave_allocations",
      "leave_requests",
      "salary_structures",
      "salary_rules",
      "payruns",
      "payslips",
      "payslip_lines",
      "audit_logs",
    ];

    const dbName = process.env.MYSQL_DATABASE || "peoplepay360";

    // 1. Fetch tables present in database
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ? AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const [tablesResult] = await pool.query(tablesQuery, [dbName]);
    const existingTableNames = tablesResult.map((r) => r.TABLE_NAME || r.table_name);

    // 2. Fetch column details for all existing tables
    const columnsQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = ?
      ORDER BY table_name, ordinal_position;
    `;
    const [columnsResult] = await pool.query(columnsQuery, [dbName]);

    // 3. Fetch foreign key relationships
    const fkQuery = `
      SELECT
        TABLE_NAME AS table_name, 
        COLUMN_NAME AS column_name, 
        REFERENCED_TABLE_NAME AS foreign_table_name,
        REFERENCED_COLUMN_NAME AS foreign_column_name 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL;
    `;
    const [fkResult] = await pool.query(fkQuery, [dbName]);

    // 4. Query row counts for each table
    const tableDetails = [];
    let totalRowCount = 0;

    for (const tableName of expectedTables) {
      const exists = existingTableNames.includes(tableName);
      let count = 0;

      if (exists) {
        try {
          const [countRes] = await pool.query(`SELECT COUNT(*) AS count FROM \`${tableName}\`;`);
          count = countRes[0]?.count || 0;
          totalRowCount += count;
        } catch {
          count = -1;
        }
      }

      const columns = columnsResult.filter((c) => (c.TABLE_NAME || c.table_name) === tableName);
      const foreignKeys = fkResult.filter((fk) => (fk.TABLE_NAME || fk.table_name) === tableName);

      tableDetails.push({
        name: tableName,
        exists,
        rowCount: count,
        columnCount: columns.length,
        columns: columns.map((c) => ({
          name: c.COLUMN_NAME || c.column_name,
          type: c.DATA_TYPE || c.data_type,
          nullable: (c.IS_NULLABLE || c.is_nullable) === "YES",
          default: c.COLUMN_DEFAULT || c.column_default,
        })),
        foreignKeys: foreignKeys.map((fk) => ({
          column: fk.COLUMN_NAME || fk.column_name,
          referencesTable: fk.REFERENCED_TABLE_NAME || fk.foreign_table_name,
          referencesColumn: fk.REFERENCED_COLUMN_NAME || fk.foreign_column_name,
        })),
      });
    }

    // 5. Query MySQL database info
    const [versionRes] = await pool.query(`SELECT VERSION() AS version;`);

    return successResponse(res, {
      statusCode: 200,
      message: "Database analysis retrieved successfully.",
      data: {
        databaseEngine: "MySQL 8.0 (Local)",
        version: versionRes[0]?.version,
        schema: dbName,
        totalExpectedTables: expectedTables.length,
        totalExistingTables: existingTableNames.length,
        totalRecords: totalRowCount,
        isFullyCompliant: expectedTables.every((t) => existingTableNames.includes(t)),
        architectureFlow: [
          "1. Roles & Users (roles, users)",
          "2. Core Master Data (departments, working_schedules, employees)",
          "3. Workforce Tracking (contracts, attendance, leave_types, leave_allocations, leave_requests)",
          "4. Payroll Engine (salary_structures, salary_rules, payruns, payslips, payslip_lines)",
          "5. Audit & Compliance (audit_logs)",
        ],
        tables: tableDetails,
      },
    });
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: "Failed to perform database analysis: " + error.message,
    });
  }
};

module.exports = {
  getDatabaseAnalysis,
};
