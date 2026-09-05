const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

/**
 * MySQL Connection Pool for PeoplePay360
 */
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "peoplepay360",
  port: parseInt(process.env.MYSQL_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true, // Needed for running full SQL scripts
});

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
};
