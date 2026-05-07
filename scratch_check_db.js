const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ydndrkxchypzaywhbywg:bosmentai22@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function checkTable() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'menu'
    `);
    console.log("Table 'menu' columns:");
    res.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkTable();
