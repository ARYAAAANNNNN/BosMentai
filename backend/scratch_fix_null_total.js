const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixNullTotalHarga() {
  try {
    const result = await pool.query('UPDATE pesanan SET total_harga = 0 WHERE total_harga IS NULL');
    console.log(`Updated ${result.rowCount} orders with NULL total_harga.`);
  } catch (err) {
    console.error('Error fixing NULL total_harga:', err);
  } finally {
    await pool.end();
  }
}

fixNullTotalHarga();
