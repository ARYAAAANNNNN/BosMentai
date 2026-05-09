const pool = require('./src/config/db');

async function checkTransactionsSchema() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
    console.log("Transactions columns:", cols.rows.map(r => r.column_name));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkTransactionsSchema();
