require('dotenv').config();
const { pool } = require('../src/config/mysqlDb');

async function checkAllocations() {
  const [types] = await pool.query('SELECT * FROM leave_types');
  console.log('Leave Types:');
  console.table(types.map(t => ({ id: t.id, name: t.name, code: t.code, req_alloc: t.requires_allocation })));

  const [allocs] = await pool.query(`
    SELECT la.employee_id, lt.name, la.total_days, la.used_days, (la.total_days - la.used_days) as remaining
    FROM leave_allocations la
    JOIN leave_types lt ON la.leave_type_id = lt.id
    WHERE la.employee_id = 1
  `);
  console.log('Employee 1 Allocations:');
  console.table(allocs);

  const [reqs] = await pool.query(`
    SELECT lr.id, lr.employee_id, lt.name, lr.days, lr.status
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = 1
  `);
  console.log('Employee 1 Requests:');
  console.table(reqs);

  process.exit(0);
}

checkAllocations().catch(err => {
  console.error(err);
  process.exit(1);
});
