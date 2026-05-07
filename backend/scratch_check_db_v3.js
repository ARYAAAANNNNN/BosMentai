const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ydndrkxchypzaywhbywg:bosmentai22@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function check() {
  try {
    const resCat = await pool.query('SELECT * FROM kategori');
    console.log("Categories:", resCat.rows);
    
    const resMenu = await pool.query('SELECT * FROM menu LIMIT 1');
    console.log("Menu Sample:", resMenu.rows[0]);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

check();
