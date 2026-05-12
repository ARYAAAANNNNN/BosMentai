const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPesananTable() {
  try {
    const { rows } = await pool.query("SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'pesanan' AND column_name = 'total_harga'");
    console.table(rows);
  } catch (err) {
    console.error('Error checking pesanan table:', err);
  } finally {
    await pool.end();
  }
}

checkPesananTable();
