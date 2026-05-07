const pool = require('./src/config/db');

async function checkSchema() {
  try {
    const pesananCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pesanan'
    `);
    console.log("Pesanan columns:", pesananCols.rows.map(r => r.column_name));

    const detailCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'detail_pesanan'
    `);
    console.log("Detail Pesanan columns:", detailCols.rows.map(r => r.column_name));
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
