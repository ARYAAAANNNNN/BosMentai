const pool = require('./src/config/db');

async function checkEnum() {
  try {
    const res = await pool.query(`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'status_pesanan_enum'
    `);
    console.log("Enum values:", res.rows.map(r => r.enumlabel));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkEnum();
