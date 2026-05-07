const pool = require('./src/config/db');

async function checkNullable() {
  try {
    const res = await pool.query(`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pesanan'
    `);
    console.log("Pesanan schema:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkNullable();
