const pool = require('./src/config/db');
async function checkConstraints() {
  try {
    // Check for CHECK constraints
    const checkRes = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'pesanan'::regclass AND contype = 'c'
    `);
    console.log('CHECK Constraints on pesanan:', checkRes.rows);

    // Check for ENUM types if status_pesanan is an enum
    const typeRes = await pool.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'status_pesanan_type' OR t.typname LIKE '%status%'
    `);
    console.log('ENUM Types:', typeRes.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
checkConstraints();
