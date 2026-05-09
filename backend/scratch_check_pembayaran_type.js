const pool = require('./src/config/db');
async function checkStatusPembayaranType() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'pesanan' AND column_name = 'status_pembayaran'
    `);
    console.log('pesanan.status_pembayaran type:', res.rows[0]);
    
    // Also check the enum values for this type if it's user-defined
    if (res.rows[0]?.data_type === 'USER-DEFINED') {
      const enumVals = await pool.query(`
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1)
      `, [res.rows[0].udt_name]);
      console.log('Enum values for ' + res.rows[0].udt_name + ':', enumVals.rows.map(r => r.enumlabel));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
checkStatusPembayaranType();
