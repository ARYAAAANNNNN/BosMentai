const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixStock() {
  try {
    const result = await pool.query('UPDATE menu SET stok = 50 WHERE stok <= 0 AND is_active = 1');
    console.log(`Updated ${result.rowCount} menu items stock.`);
  } catch (err) {
    console.error('Error fixing stock:', err);
  } finally {
    await pool.end();
  }
}

fixStock();
