const { pool } = require("../src/config/mysqlDb");

async function fixSchedules() {
  try {
    await pool.query(`
      UPDATE working_schedules
      SET tuesday_start = monday_start, tuesday_end = monday_end,
          wednesday_start = monday_start, wednesday_end = monday_end,
          thursday_start = monday_start, thursday_end = monday_end,
          friday_start = monday_start, friday_end = monday_end
      WHERE code IN ('STD_9_6', 'FLEX_10_7', 'PART_TIME', 'SHIFT_A', 'SHIFT_B', 'SHIFT_C');
    `);
    console.log("✅ Working schedules Mon-Fri updated successfully!");
    const [s] = await pool.query("SELECT id, name, code, monday_start, tuesday_start, wednesday_start, thursday_start, friday_start FROM working_schedules WHERE id = 1");
    console.log("Updated schedule 1:", s[0]);
    process.exit(0);
  } catch (err) {
    console.error("Error fixing schedules:", err);
    process.exit(1);
  }
}

fixSchedules();
