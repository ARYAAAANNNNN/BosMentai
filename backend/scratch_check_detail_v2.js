const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDetailColumns() {
  try {
    const { rows } = await pool.query("SELECT * FROM detail_pesanan LIMIT 0");
    console.log('Columns in detail_pesanan:', Object.keys(rows[0] || {}));
  } catch (err) {
    // If table is empty, Object.keys(rows[0]) won't work. Use information_schema instead.
    const { rows: columns } = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'detail_pesanan'");
    console.table(columns);
  } finally {
    await pool.end();
  }
}

checkDetailColumns();
