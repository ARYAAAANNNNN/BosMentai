const pool = require('./src/config/db');

async function runMigration() {
  try {
    console.log('Running migration to add new enum values...');
    
    // Add new values to status_pesanan_enum
    // Note: ALTER TYPE ADD VALUE cannot be run inside a transaction block in some PG versions
    await pool.query("ALTER TYPE status_pesanan_enum ADD VALUE IF NOT EXISTS 'Menunggu Konfirmasi'");
    console.log('Added: Menunggu Konfirmasi');
    
    await pool.query("ALTER TYPE status_pesanan_enum ADD VALUE IF NOT EXISTS 'Terkonfirmasi'");
    console.log('Added: Terkonfirmasi');

    // Add new values to order_status just in case
    try {
      await pool.query("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Menunggu Konfirmasi'");
      await pool.query("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Terkonfirmasi'");
      console.log('Added to order_status as well');
    } catch (e) {
      console.log('order_status type might not exist or differ, skipping.');
    }

    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
