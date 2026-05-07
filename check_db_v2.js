require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/src/config/db');

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'menu' 
      AND column_name IN ('harga', 'id_kategori')
    `);
    console.log("Existing columns:", res.rows.map(r => r.column_name));
    
    if (res.rows.length < 2) {
      console.log("❌ DATABASE BELUM TERUPDATE! Ada kolom yang kurang.");
    } else {
      console.log("✅ Database sudah oke.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    pool.end();
  }
}
check();
