require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/src/config/db');

async function test() {
  try {
    const r1 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'menu'");
    console.log("Columns in menu:", r1.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}
test();
