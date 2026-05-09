const pool = require('./src/config/db');
async function checkAllSchemas() {
  try {
    const pesanan = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'pesanan'");
    console.log('pesanan columns:', pesanan.rows.map(r => r.column_name));

    const detail = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'detail_pesanan'");
    console.log('detail_pesanan columns:', detail.rows.map(r => r.column_name));
    
    const trx = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'");
    console.log('transactions columns:', trx.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
checkAllSchemas();
