const pool = require('./src/config/db');

async function checkStatuses() {
  try {
    const res = await pool.query(`
      SELECT DISTINCT status_pesanan FROM pesanan
    `);
    console.log("Current statuses in DB:", res.rows.map(r => r.status_pesanan));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkStatuses();
