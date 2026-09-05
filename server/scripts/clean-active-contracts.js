const { pool } = require("../src/config/mysqlDb");

async function main() {
  const [res] = await pool.query(`
    UPDATE contracts 
    SET end_date = NULL 
    WHERE status = 'ACTIVE' AND end_date IS NOT NULL;
  `);
  console.log("✅ Updated active contracts to ongoing (NULL end_date):", res.affectedRows);

  process.exit(0);
}

main();
