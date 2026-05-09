const pool = require('./src/config/db');
async function checkTransactionsColTypes() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
    console.log('transactions column types:', res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
checkTransactionsColTypes();
