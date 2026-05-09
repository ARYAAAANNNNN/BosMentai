const pool = require('./src/config/db');
async function verify() {
  try {
    const res = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_pesanan_enum')
    `);
    console.log('Current status_pesanan_enum labels:', res.rows.map(r => r.enumlabel));
  } finally {
    await pool.end();
  }
}
verify();
