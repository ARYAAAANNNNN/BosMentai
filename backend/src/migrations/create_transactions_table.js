'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../config/db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add payment status column to pesanan table
    await client.query(`
      ALTER TABLE pesanan 
      ADD COLUMN IF NOT EXISTS status_pembayaran VARCHAR(50) DEFAULT 'unpaid'
    `);
    console.log('✅ Column status_pembayaran added to pesanan');

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        id_pesanan INTEGER NOT NULL,
        order_id VARCHAR(100) UNIQUE NOT NULL,
        gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        payment_type VARCHAR(50) DEFAULT 'qris',
        transaction_id VARCHAR(100),
        transaction_status VARCHAR(50) DEFAULT 'pending',
        qr_url TEXT,
        midtrans_response JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        expired_at TIMESTAMPTZ,
        CONSTRAINT fk_transactions_pesanan 
          FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table transactions created');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_id_pesanan ON transactions(id_pesanan)
    `);
    console.log('✅ Indexes created');

    await client.query('COMMIT');
    console.log('\n🎉 Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
};

migrate();
