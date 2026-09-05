const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

async function initMysqlDb() {
  console.log("🚀 Initializing PeoplePay360 MySQL Database (16 Tables)...");

  const config = {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    multipleStatements: true,
  };

  let connection;

  try {
    // 1. Connect without database to ensure database exists
    connection = await mysql.createConnection(config);
    console.log(`🔌 Connected to MySQL server at ${config.host}:${config.port}`);

    await connection.query(
      "CREATE DATABASE IF NOT EXISTS `peoplepay360` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    );
    console.log("✅ Database `peoplepay360` verified/created.");

    await connection.changeUser({ database: "peoplepay360" });

    // 2. Read and execute schema_mysql.sql
    console.log("📄 Executing schema_mysql.sql (16 Tables, Constraints, Indexes)...");
    const schemaSql = fs.readFileSync(path.join(__dirname, "../src/config/schema_mysql.sql"), "utf-8");
    await connection.query(schemaSql);
    console.log("✅ 16 MySQL tables created successfully.");

    // 3. Read and execute seed_mysql.sql
    console.log("🌱 Executing seed_mysql.sql (Populating test records matching all 16 UI views)...");
    const seedSql = fs.readFileSync(path.join(__dirname, "../src/config/seed_mysql.sql"), "utf-8");
    await connection.query(seedSql);
    console.log("✅ Seed data inserted successfully.");

    // 4. Verify counts
    const [tables] = await connection.query("SHOW TABLES;");
    const [empCount] = await connection.query("SELECT COUNT(*) AS total FROM employees;");
    const [deptCount] = await connection.query("SELECT COUNT(*) AS total FROM departments;");
    const [payrunCount] = await connection.query("SELECT COUNT(*) AS total FROM payruns;");

    console.log("\n=======================================================");
    console.log(`🎉 PeoplePay360 MySQL Database Ready!`);
    console.log(`   - Total Tables:      ${tables.length} / 16`);
    console.log(`   - Seeded Employees:  ${empCount[0].total}`);
    console.log(`   - Seeded Depts:      ${deptCount[0].total}`);
    console.log(`   - Seeded Payruns:    ${payrunCount[0].total}`);
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Error initializing MySQL database:", error.message);
    console.error("\n💡 TIP: Please verify your MySQL credentials in server/.env:");
    console.error("   MYSQL_HOST=localhost");
    console.error("   MYSQL_PORT=3306");
    console.error("   MYSQL_USER=root");
    console.error("   MYSQL_PASSWORD=your_mysql_password\n");
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initMysqlDb();
