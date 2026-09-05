const { pool } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Controller to provide complete database analysis and metadata
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

    // 1. Fetch tables present in public schema
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tablesResult = await pool.query(tablesQuery);
    const existingTableNames = tablesResult.rows.map((r) => r.table_name);

    // 2. Fetch column details for all existing tables
    const columnsQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    const columnsResult = await pool.query(columnsQuery);

    // 3. Fetch foreign key relationships
    const fkQuery = `
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;
    const fkResult = await pool.query(fkQuery);

    // 4. Query row counts for each table
    const tableDetails = [];
    let totalRowCount = 0;

    for (const tableName of expectedTables) {
      const exists = existingTableNames.includes(tableName);
      let count = 0;

      if (exists) {
        try {
          const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM public.${tableName};`);
          count = countRes.rows[0]?.count || 0;
          totalRowCount += count;
        } catch {
          count = -1;
        }
      }

      const columns = columnsResult.rows.filter((c) => c.table_name === tableName);
      const foreignKeys = fkResult.rows.filter((fk) => fk.table_name === tableName);

      tableDetails.push({
        name: tableName,
        exists,
        rowCount: count,
        columnCount: columns.length,
        columns: columns.map((c) => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === "YES",
          default: c.column_default,
        })),
        foreignKeys: foreignKeys.map((fk) => ({
          column: fk.column_name,
          referencesTable: fk.foreign_table_name,
          referencesColumn: fk.foreign_column_name,
        })),
      });
    }

    // 5. Query PostgreSQL database info
    const versionRes = await pool.query(`SELECT version();`);

    return successResponse(res, {
      statusCode: 200,
      message: "Database analysis retrieved successfully.",
      data: {
        databaseEngine: "PostgreSQL / Supabase",
        version: versionRes.rows[0]?.version,
        schema: "public",
        totalExpectedTables: expectedTables.length,
        totalExistingTables: existingTableNames.length,
        totalRecords: totalRowCount,
        isFullyCompliant: expectedTables.every((t) => existingTableNames.includes(t)),
        architectureFlow: [
          "1. Roles & Users (auth.users -> public.users)",
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
