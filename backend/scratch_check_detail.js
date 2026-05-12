const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDetailPesanan() {
  try {
    const { rows } = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'detail_pesanan'");
    console.table(rows);
  } catch (err) {
    console.error('Error checking detail_pesanan table:', err);
  } finally {
    await pool.end();
  }
}

checkDetailPesanan();
