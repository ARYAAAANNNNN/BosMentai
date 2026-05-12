const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPesananAll() {
  try {
    const { rows } = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'pesanan'");
    console.table(rows);
  } catch (err) {
    console.error('Error checking pesanan table:', err);
  } finally {
    await pool.end();
  }
}

checkPesananAll();
