const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkMenu() {
  try {
    const { rows } = await pool.query('SELECT id_menu, nama_menu, stok, is_active FROM menu');
    console.log('Menu Items:');
    console.table(rows);
  } catch (err) {
    console.error('Error checking menu:', err);
  } finally {
    await pool.end();
  }
}

checkMenu();
