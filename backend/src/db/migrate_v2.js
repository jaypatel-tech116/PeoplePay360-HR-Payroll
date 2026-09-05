/**
 * Migration V2 Runner
 * Runs the non-destructive migration_v2.sql against the database.
 * Safe to run multiple times.
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrateV2() {
  const client = await pool.connect();
  try {
    const sqlPath = path.join(__dirname, 'migration_v2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running Migration V2: Security & Multi-Company Foundation...');
    await client.query(sql);
    console.log('✅ Migration V2 completed successfully.');
    
    // Verify new tables exist
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('companies', 'registration_requests', 'otp_verifications', 'user_sessions', 'role_permissions', 'audit_logs')
      ORDER BY table_name;
    `);
    console.log('✅ New tables verified:', tableCheck.rows.map(r => r.table_name).join(', '));
    
    // Verify company_id columns added
    const colCheck = await client.query(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE column_name = 'company_id'
      AND table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('✅ company_id columns:', colCheck.rows.map(r => r.table_name).join(', '));
    
  } catch (err) {
    console.error('❌ Migration V2 failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateV2().catch(() => process.exit(1));
