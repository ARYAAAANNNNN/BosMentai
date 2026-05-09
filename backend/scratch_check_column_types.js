const pool = require('./src/config/db');
async function checkColumnTypes() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'pesanan' AND column_name = 'status_pesanan'
    `);
    console.log('pesanan.status_pesanan type:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
checkColumnTypes();
