const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkEnum() {
  try {
    const { rows } = await pool.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'status_pesanan_enum'");
    console.table(rows);
  } catch (err) {
    console.error('Error checking enum:', err);
  } finally {
    await pool.end();
  }
}

checkEnum();
