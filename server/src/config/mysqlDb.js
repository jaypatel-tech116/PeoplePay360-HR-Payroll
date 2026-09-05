const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:Jay1126@127.0.0.1:5432/peoplepay360";

const isLocalhost =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

// Initialize PostgreSQL Connection Pool
const pgPool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

pgPool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err.message);
});

/**
 * Transform MySQL-style queries to PostgreSQL-compatible syntax
 * - Converts '?' placeholders to '$1, $2, $3...'
 * - Converts MySQL backticks (`name`) to double quotes ("name")
 * - Handles JSON_OBJECT -> json_build_object
 * - Handles SHOW TABLES -> information_schema query
 * - Appends RETURNING id for INSERT queries to populate insertId
 */
function transformQuery(sql, params = []) {
  if (typeof sql !== "string") {
    return { sql, params, isInsert: false, hasReturning: false };
  }

  let paramIndex = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let out = "";

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    const prev = i > 0 ? sql[i - 1] : "";

    if (c === "'" && prev !== "\\") {
      if (!inDoubleQuote) inSingleQuote = !inSingleQuote;
      out += c;
    } else if (c === '"' && prev !== "\\") {
      if (!inSingleQuote) inDoubleQuote = !inDoubleQuote;
      out += c;
    } else if (c === "`" && prev !== "\\") {
      out += '"';
    } else if (c === "?" && !inSingleQuote && !inDoubleQuote) {
      out += `$${paramIndex++}`;
    } else {
      out += c;
    }
  }

  // Compatibility transformations
  out = out.replace(/\bJSON_OBJECT\s*\(/gi, "json_build_object(");

  if (/^\s*SHOW\s+TABLES/i.test(out)) {
    out =
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';";
  }

  // Handle MySQL ON DUPLICATE KEY UPDATE -> PostgreSQL ON CONFLICT ... DO UPDATE SET
  if (/ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(out)) {
    let target = "(id)";
    if (/\battendance\b/i.test(out)) {
      target = "(employee_id, attendance_date)";
    } else if (/\bleave_allocations\b/i.test(out)) {
      target = "(employee_id, leave_type_id)";
    } else if (/\busers\b/i.test(out)) {
      target = "(id)";
    } else if (/\bemployees\b/i.test(out)) {
      target = "(employee_code)";
    } else if (/\bcontracts\b/i.test(out)) {
      target = "(contract_number)";
    } else if (/\broles\b/i.test(out)) {
      target = "(code)";
    } else if (/\bdepartments\b/i.test(out)) {
      target = "(name)";
    } else if (/\bleave_types\b/i.test(out)) {
      target = "(code)";
    } else if (/\bsalary_structures\b/i.test(out)) {
      target = "(code)";
    } else if (/\bsalary_rules\b/i.test(out)) {
      target = "(code)";
    } else if (/\bpayruns\b/i.test(out)) {
      target = "(run_number)";
    } else if (/\bpayslips\b/i.test(out)) {
      target = "(payslip_number)";
    }
    out = out.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE/i,
      `ON CONFLICT ${target} DO UPDATE SET`
    );
    out = out.replace(/VALUES\s*\(\s*([a-zA-Z0-9_]+)\s*\)/gi, "EXCLUDED.$1");
  }

  const isInsert = /^\s*INSERT\s+INTO\s+/i.test(out);
  const hasReturning = /\bRETURNING\b/i.test(out);

  if (isInsert && !hasReturning) {
    const trimmed = out.trim().replace(/;+\s*$/, "");
    out = trimmed + " RETURNING id;";
  }

  const mappedParams = (Array.isArray(params) ? params : []).map((p) => {
    if (p === undefined) return null;
    if (p === "peoplepay360" && /information_schema/i.test(sql)) {
      return "public";
    }
    return p;
  });

  return { sql: out, params: mappedParams, isInsert, hasReturning };
}

/**
 * Execute query against a pg pool or client and return dual-compatible [rows, fields]
 * Supports both mysql2 style: const [rows] = await pool.query(...)
 * and pg style: const res = await pool.query(...); res.rows
 */
async function executeQuery(executor, rawSql, rawParams = []) {
  const { sql, params, isInsert, hasReturning } = transformQuery(
    rawSql,
    rawParams
  );

  const res = await executor.query(sql, params);

  // Handle INSERT queries with auto-attached RETURNING id
  if (isInsert && !hasReturning) {
    const returnedId = res.rows[0]?.id;
    const numId = Number(returnedId);
    const insertId =
      returnedId != null ? (isNaN(numId) ? returnedId : numId) : 0;

    const result = {
      insertId,
      affectedRows: res.rowCount || 0,
      ...(res.rows[0] || {}),
    };

    const retArray = [result, []];
    retArray.rows = res.rows;
    retArray.rowCount = res.rowCount;
    retArray.insertId = insertId;
    retArray.command = res.command;
    return retArray;
  }

  // Handle other DML commands (UPDATE, DELETE)
  if (res.command === "UPDATE" || res.command === "DELETE") {
    const result = {
      affectedRows: res.rowCount || 0,
      changedRows: res.rowCount || 0,
      insertId: 0,
    };

    const retArray = [result, []];
    retArray.rows = res.rows;
    retArray.rowCount = res.rowCount;
    retArray.command = res.command;
    return retArray;
  }

  // SELECT or other commands with returned rows
  const retArray = [res.rows, res.fields || []];
  retArray.rows = res.rows;
  retArray.rowCount = res.rowCount;
  retArray.command = res.command;
  return retArray;
}

/**
 * Get a connection from the pool with transaction support
 */
async function getConnection() {
  const client = await pgPool.connect();
  return {
    query: (sql, params = []) => executeQuery(client, sql, params),
    beginTransaction: async () => {
      await client.query("BEGIN;");
    },
    commit: async () => {
      await client.query("COMMIT;");
    },
    rollback: async () => {
      await client.query("ROLLBACK;");
    },
    release: () => {
      client.release();
    },
    changeUser: async () => {},
  };
}

/**
 * Drop-in MySQL-compatible pool interface powered by PostgreSQL
 */
const pool = {
  query: (sql, params = []) => executeQuery(pgPool, sql, params),
  getConnection,
  end: () => pgPool.end(),
  on: (event, handler) => pgPool.on(event, handler),
};

module.exports = {
  pool,
  query: (sql, params = []) => pool.query(sql, params),
};
