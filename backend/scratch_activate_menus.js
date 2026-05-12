const { Pool } = require('pg');
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Dotenv error:', result.error);
}

console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function activateMenus() {
  try {
    const result = await pool.query('UPDATE menu SET is_active = 1 WHERE is_active = 0 AND stok > 0');
    console.log(`Updated ${result.rowCount} menu items to active.`);
  } catch (err) {
    console.error('Error activating menus:', err);
  } finally {
    await pool.end();
  }
}

activateMenus();
